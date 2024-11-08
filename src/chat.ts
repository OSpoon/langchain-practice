import process from 'node:process'
import chalk from 'chalk'
import inquirer from 'inquirer'

export interface ChatAgent {
  respond: (input: string) => Promise<string>
}

export class ChatBot {
  chatAgent: ChatAgent
  constructor(chatAgent: ChatAgent) {
    this.chatAgent = chatAgent
  }

  private async askQuestion() {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'message',
          message: chalk.blue('Q：'),
        },
      ])

      const input = answers.message.trim()
      const response = await this.chatAgent.respond(input)
      console.log(chalk.green(`A：${response}`))
      this.askQuestion()
    }
    catch (error: unknown) {
      if ((error as any).message.includes('User force closed the prompt')) {
        console.log('\nBye！')
        process.exit(0)
      }
      else {
        console.error('An error occurred：', error)
        process.exit(1)
      }
    }
  }

  public async run() {
    console.log(chalk.bold('Start a new conversation.'))
    await this.askQuestion()
  }
}
