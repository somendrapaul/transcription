import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

interface SentenceStructure {
  subject: string
  verb: string
  object: string
  tense: string
  mood: string
}

class AdvancedNLP {
  private async analyzeSentence(sentence: string): Promise<SentenceStructure> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4"),
        prompt: `Analyze the following Bangla sentence and return a JSON object with the subject, verb, object, tense, and mood:

        Sentence: ${sentence}

        Return only the JSON object, no other text.`,
      })

      return JSON.parse(text)
    } catch (error) {
      console.error("Error analyzing sentence:", error)
      return { subject: "", verb: "", object: "", tense: "", mood: "" }
    }
  }

  async translateIdiom(idiom: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4"),
        prompt: `Translate the following Bangla idiom to Hindi, preserving its meaning and cultural context as much as possible:

        Bangla Idiom: ${idiom}

        Return only the Hindi translation, no other text.`,
      })

      return text
    } catch (error) {
      console.error("Error translating idiom:", error)
      return idiom // Return original idiom if translation fails
    }
  }

  async handleComplexStructure(sentence: string): Promise<string> {
    const structure = await this.analyzeSentence(sentence)

    // Handle different tenses
    const tenseMap: { [key: string]: string } = {
      present: "वर्तमान काल",
      past: "भूतकाल",
      future: "भविष्य काल",
      "present perfect": "पूर्ण वर्तमान काल",
      "past perfect": "पूर्ण भूतकाल",
      "future perfect": "पूर्ण भविष्य काल",
    }

    // Handle different moods
    const moodMap: { [key: string]: string } = {
      indicative: "सूचक",
      imperative: "आज्ञार्थ",
      subjunctive: "संभावनार्थ",
      conditional: "शर्तिया",
    }

    try {
      const { text } = await generateText({
        model: openai("gpt-4"),
        prompt: `Translate the following Bangla sentence to Hindi, considering its structure:

        Bangla: ${sentence}
        Subject: ${structure.subject}
        Verb: ${structure.verb}
        Object: ${structure.object}
        Tense: ${tenseMap[structure.tense] || structure.tense}
        Mood: ${moodMap[structure.mood] || structure.mood}

        Ensure the Hindi translation maintains the same structure, tense, and mood. Return only the Hindi translation, no other text.`,
      })

      return text
    } catch (error) {
      console.error("Error handling complex structure:", error)
      return sentence // Return original sentence if handling fails
    }
  }
}

export const advancedNLP = new AdvancedNLP()

