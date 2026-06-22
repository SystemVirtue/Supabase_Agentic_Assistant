import logging
from typing import Annotated, TypedDict

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict

from cognitive_engine.app.db_client import CognitiveDBClient
from cognitive_engine.app.meta_cognitive_controller import MetaCognitiveController

logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    """State for the LangGraph agent."""
    messages: Annotated[list[BaseMessage], add_messages]
    query: str
    reasoning_result: str
    world_state_context: dict


class LangGraphAgent:
    """Primary Agent Graph that can query WSS, fetch episodic memory, and use tools."""

    def __init__(self, db_client: CognitiveDBClient, mcc: MetaCognitiveController):
        self._db = db_client
        self._mcc = mcc
        self._graph = None

    @tool
    async def query_world_state(self, entity_id: str, attribute: str | None = None) -> str:
        """
        Query the World State Service for current entity state.

        Args:
            entity_id: The entity to query
            attribute: Optional attribute filter

        Returns:
            Current state as JSON string
        """
        # This would call the WSS API
        # For now, return a mock response
        return f"World state for {entity_id}" + (f" with attribute {attribute}" if attribute else "")

    @tool
    async def query_historical_state(
        self, entity_id: str, timestamp: str, attribute: str | None = None
    ) -> str:
        """
        Query historical world state at a specific timestamp.

        Args:
            entity_id: The entity to query
            timestamp: ISO 8601 timestamp
            attribute: Optional attribute filter

        Returns:
            Historical state as JSON string
        """
        # This would call the WSS time-travel API
        return f"Historical state for {entity_id} at {timestamp}"

    @tool
    async def search_episodic_memory(self, query: str, limit: int = 5) -> str:
        """
        Search episodic memory for relevant past events.

        Args:
            query: Search query
            limit: Maximum number of results

        Returns:
            Relevant episodes as JSON string
        """
        # This would use pgvector similarity search
        return f"Episodic memory search results for: {query}"

    async def classify_complexity(self, state: AgentState) -> AgentState:
        """Classify the complexity of the current query."""
        query = state["query"]
        complexity = await self._mcc.classify_only(query=query)

        logger.info(f"Query complexity: {complexity.value}")

        # Store complexity in state for routing
        state["messages"].append(
            SystemMessage(content=f"Query classified as {complexity.value} complexity")
        )

        return state

    async def reason(self, state: AgentState) -> AgentState:
        """Execute reasoning using the MCC."""
        query = state["query"]

        # Process through MCC
        routing_decision, completion_response = await self._mcc.process_request(query=query)

        logger.info(f"Routing decision: {routing_decision.model_selected}")

        # Extract reasoning result
        if completion_response and "choices" in completion_response:
            reasoning_result = completion_response["choices"][0]["message"]["content"]
        else:
            reasoning_result = str(completion_response)

        state["reasoning_result"] = reasoning_result
        state["messages"].append(HumanMessage(content=reasoning_result))

        return state

    async def fetch_world_state(self, state: AgentState) -> AgentState:
        """Fetch relevant world state context."""
        # Extract entity IDs from the query (simplified)
        query = state["query"].lower()

        # Mock entity extraction
        entity_ids = []
        if "camera" in query:
            entity_ids.append("camera-001")
        if "sensor" in query:
            entity_ids.append("sensor-001")

        world_state_context = {}
        for entity_id in entity_ids:
            # Query WSS for state
            state_data = await self.query_world_state(entity_id)
            world_state_context[entity_id] = state_data

        state["world_state_context"] = world_state_context
        state["messages"].append(
            SystemMessage(content=f"World state context: {world_state_context}")
        )

        return state

    def build_graph(self) -> StateGraph:
        """Build the LangGraph agent graph."""
        workflow = StateGraph(AgentState)

        # Add nodes
        workflow.add_node("classify_complexity", self.classify_complexity)
        workflow.add_node("fetch_world_state", self.fetch_world_state)
        workflow.add_node("reason", self.reason)

        # Set entry point
        workflow.set_entry_point("classify_complexity")

        # Add edges
        workflow.add_edge("classify_complexity", "fetch_world_state")
        workflow.add_edge("fetch_world_state", "reason")
        workflow.add_edge("reason", END)

        self._graph = workflow.compile(checkpointer=self._db.get_checkpointer())

        logger.info("LangGraph agent graph built successfully")

        return self._graph

    async def invoke(self, query: str, thread_id: str) -> dict:
        """
        Invoke the agent with a query.

        Args:
            query: User query
            thread_id: Thread ID for state persistence

        Returns:
            Agent response
        """
        if self._graph is None:
            self.build_graph()

        config = {"configurable": {"thread_id": thread_id}}

        initial_state = AgentState(
            messages=[HumanMessage(content=query)],
            query=query,
            reasoning_result="",
            world_state_context={},
        )

        result = await self._graph.ainvoke(initial_state, config)

        return result
