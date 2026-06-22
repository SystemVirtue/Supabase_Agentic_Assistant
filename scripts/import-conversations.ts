import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://zgelhzaeoaxhpubalyvz.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ImportedMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

interface ConversationImport {
  platform: string
  title?: string
  messages: ImportedMessage[]
}

// Platform-specific parsers
const parsers = {
  chatgpt: (data: any): ConversationImport => {
    // ChatGPT export format (JSON)
    return {
      platform: 'chatgpt',
      title: data.title || 'Imported ChatGPT Conversation',
      messages: data.messages?.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
      })) || [],
    }
  },

  claude: (data: any): ConversationImport => {
    // Claude export format
    return {
      platform: 'claude',
      title: data.name || 'Imported Claude Conversation',
      messages: data.conversation?.map((msg: any) => ({
        role: msg.role === 'human' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: msg.timestamp,
      })) || [],
    }
  },

  grok: (data: any): ConversationImport => {
    // Grok export format
    return {
      platform: 'grok',
      title: data.title || 'Imported Grok Conversation',
      messages: data.messages?.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
        timestamp: msg.timestamp,
      })) || [],
    }
  },

  gemini: (data: any): ConversationImport => {
    // Gemini export format
    return {
      platform: 'gemini',
      title: data.title || 'Imported Gemini Conversation',
      messages: data.turns?.map((turn: any) => [
        { role: 'user', content: turn.user_input, timestamp: turn.timestamp },
        { role: 'assistant', content: turn.model_response, timestamp: turn.timestamp },
      ]).flat() || [],
    }
  },

  deepseek: (data: any): ConversationImport => {
    // DeepSeek export format
    return {
      platform: 'deepseek',
      title: data.title || 'Imported DeepSeek Conversation',
      messages: data.messages?.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
      })) || [],
    }
  },
}

async function importConversation(userId: string, importData: ConversationImport) {
  try {
    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: importData.title || `Imported ${importData.platform} Conversation`,
      })
      .select()
      .single()

    if (convError) throw convError

    // Insert messages
    const messages = importData.messages.map(msg => ({
      conversation_id: conversation.id,
      role: msg.role,
      content: msg.content,
      created_at: msg.timestamp ? new Date(msg.timestamp).toISOString() : undefined,
    }))

    const { error: msgError } = await supabase
      .from('messages')
      .insert(messages)

    if (msgError) throw msgError

    // Store raw import data
    await supabase
      .from('imported_histories')
      .insert({
        user_id: userId,
        source_platform: importData.platform,
        raw_data: importData,
        message_count: importData.messages.length,
      })

    console.log(`✅ Imported conversation: ${conversation.title} (${importData.messages.length} messages)`)
    return conversation
  } catch (error) {
    console.error(`❌ Failed to import conversation:`, error)
    throw error
  }
}

async function importFromFile(filePath: string, platform: string, userId: string) {
  try {
    const fs = await import('fs')
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    const parser = parsers[platform as keyof typeof parsers]
    if (!parser) {
      throw new Error(`Unsupported platform: ${platform}`)
    }

    const importData = parser(data)
    await importConversation(userId, importData)
  } catch (error) {
    console.error(`❌ Failed to import from file:`, error)
    throw error
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 3) {
    console.log('Usage: npm run import <platform> <file_path> <user_id>')
    console.log('Platforms: chatgpt, claude, grok, gemini, deepseek')
    console.log('Example: npm run import chatgpt ./exports/chatgpt-conversation.json user-uuid-here')
    process.exit(1)
  }

  const [platform, filePath, userId] = args

  console.log(`📥 Importing conversation from ${platform}...`)
  await importFromFile(filePath, platform, userId)
  console.log('✅ Import complete!')
}

if (require.main === module) {
  main().catch(console.error)
}

export { importConversation, importFromFile, parsers }
