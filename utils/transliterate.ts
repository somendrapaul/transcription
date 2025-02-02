import { advancedNLP } from "./advancedNLP"
import { transcriptionModel } from "./mlModel"

const banglaToHindiMap: { [key: string]: string } = {
  // Vowels
  অ: "अ",
  আ: "आ",
  ই: "इ",
  ঈ: "ई",
  উ: "उ",
  ঊ: "ऊ",
  ঋ: "ऋ",
  এ: "ए",
  ঐ: "ऐ",
  ও: "ओ",
  ঔ: "औ",
  // Consonants
  ক: "क",
  খ: "ख",
  গ: "ग",
  ঘ: "घ",
  ঙ: "ङ",
  চ: "च",
  ছ: "छ",
  জ: "ज",
  ঝ: "झ",
  ঞ: "ञ",
  ট: "ट",
  ঠ: "ठ",
  ড: "ड",
  ঢ: "ढ",
  ণ: "ण",
  ত: "त",
  থ: "थ",
  দ: "द",
  ধ: "ध",
  ন: "न",
  প: "प",
  ফ: "फ",
  ব: "ब",
  ভ: "भ",
  ম: "म",
  য: "य",
  র: "र",
  ল: "ल",
  শ: "श",
  ষ: "ष",
  স: "स",
  হ: "ह",
  ড়: "ड़",
  ঢ়: "ढ़",
  য়: "य",
  ৎ: "त्",
  "ং": "ं",
  "ঃ": "ः",
  "ঁ": "ँ",
  // Vowel marks
  "া": "ा",
  "ি": "ि",
  "ী": "ी",
  "ু": "ु",
  "ূ": "ू",
  "ৃ": "ृ",
  "ে": "े",
  "ৈ": "ै",
  "ো": "ो",
  "ৌ": "ौ",
  "্": "्",
  // Numerals
  "০": "०",
  "১": "१",
  "২": "२",
  "৩": "३",
  "৪": "४",
  "৫": "५",
  "৬": "६",
  "৭": "७",
  "৮": "८",
  "৯": "९",
}

const banglaConjuncts: { [key: string]: string } = {
  ক্ষ: "क्ष",
  জ্ঞ: "ज्ञ",
  শ্র: "श्र",
  ক্ক: "क्क",
  ত্ত: "त्त",
  দ্দ: "द्द",
  দ্ধ: "द्ध",
  ন্ন: "न्न",
  ল্ল: "ल्ल",
  ম্ম: "म्म",
  চ্চ: "च्च",
  জ্জ: "ज्ज",
  ট্ট: "ट्ट",
  ড্ড: "ड्ड",
  ণ্ণ: "ण्ण",
  ত্থ: "त्थ",
  প্প: "प्प",
  ব্ব: "ब्ब",
  ষ্ষ: "ष्ष",
  স্স: "स्स",
}

const commonWords: { [key: string]: string } = {
  আমি: "मैं",
  তুমি: "तुम",
  সে: "वह",
  আমরা: "हम",
  তোমরা: "तुम लोग",
  তারা: "वे",
  এই: "यह",
  ওই: "वह",
  কি: "क्या",
  কেন: "क्यों",
  কখন: "कब",
  কোথায়: "कहाँ",
  কিভাবে: "कैसे",
  ধন্যবাদ: "धन्यवाद",
  নমস্কার: "नमस्कार",
  "শুভ সকাল": "शुभ प्रभात",
  "শুভ রাত্রি": "शुभ रात्रि",
  ভালোবাসা: "प्यार",
  বাংলাদেশ: "बांग्लादेश",
  কলকাতা: "कोलकाता",
  ঢাকা: "ढाका",
  // Add more common words and names as needed
}

const idioms: { [key: string]: string } = {
  "নাকে কাঁদা": "नाक में दम करना",
  "মাথা খারাপ": "सिर खराब होना",
  "চোখে ধুলো দেওয়া": "आँखों में धूल झोंकना",
  "কানে তুলো দেওয়া": "कान में रूई डालना",
  "পেটে পেটে": "पेट में पेट",
  // Add more idioms as needed
}

function handleSpecialCases(text: string): string {
  // Handle 'র' (ra) as half-form when it comes after a consonant
  text = text.replace(/([কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযলশষসহ])র/g, "$1्र")

  // Handle 'য' (ya) as half-form when it comes after a consonant
  text = text.replace(/([কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমরলশষসহ])য/g, "$1्य")

  // Handle special case for 'ৎ' (khanda ta)
  text = text.replace(/ৎ/g, "त्")

  // New special cases
  // Handle 'ঃ' (visarga) at the end of words
  text = text.replace(/ঃ\b/g, "ह")

  // Handle 'ঁ' (chandrabindu) for nasalization
  text = text.replace(/([ািীুূেৈোৌ])ঁ/g, "ँ$1")

  // Handle 'ব' as 'व' when it's not the first letter of a word
  text = text.replace(/(?<!^|\s)ব/g, "व")

  // Handle 'ণ' as 'न' when it's not after ষ, ট, ঠ, ড, ঢ
  text = text.replace(/(?<![ষটঠডঢ])ণ/g, "न")

  return text
}

function applyPhoneticRules(text: string): string {
  // Convert 'ও' to 'व' when it's used as a consonant (e.g., in যৌবন -> यौवन)
  text = text.replace(/ও(?=[ািীুূেৈোৌ])/g, "व")

  // Handle 'এ' as 'ये' at the beginning of words
  text = text.replace(/\bএ/g, "ये")

  // Handle 'য' as 'ज' when it's followed by 'া' (া sound)
  text = text.replace(/য(?=া)/g, "ज")

  // Handle 'ড়' and 'ঢ়' more accurately
  text = text.replace(/ড়/g, "ड़")
  text = text.replace(/ঢ়/g, "ढ़")

  // Handle 'ঙ' as 'ङ्ग' when it's followed by क, ख, ग, घ
  text = text.replace(/ঙ(?=[কখগঘ])/g, "ङ्")

  // Handle 'ঞ' as 'ञ्' when it's followed by च, छ, ज, झ
  text = text.replace(/ঞ(?=[চছজঝ])/g, "ञ्")

  return text
}

function handleIdioms(text: string): string {
  for (const [bangla, hindi] of Object.entries(idioms)) {
    const regex = new RegExp(bangla, "g")
    text = text.replace(regex, hindi)
  }
  return text
}

function handleGrammaticalStructures(text: string): string {
  // Handle Bangla postpositions
  const postpositions: { [key: string]: string } = {
    এর: "का/की/के",
    কে: "को",
    তে: "में",
    থেকে: "से",
    জন্য: "के लिए",
    দ্বারা: "द्वारा",
    সাথে: "के साथ",
    পর্যন্ত: "तक",
  }

  for (const [bangla, hindi] of Object.entries(postpositions)) {
    const regex = new RegExp(`\\b(\\S+)\\s+${bangla}\\b`, "g")
    text = text.replace(regex, (match, word) => `${word} ${hindi}`)
  }

  // Handle Bangla verb conjugations (simplified)
  const verbConjugations: { [key: string]: string } = {
    করছি: "कर रहा हूँ",
    করছ: "कर रहे हो",
    করছে: "कर रहा है",
    করেছি: "किया है",
    করেছ: "किया है",
    করেছে: "किया है",
    করব: "करूँगा",
    করবে: "करेगा",
  }

  for (const [bangla, hindi] of Object.entries(verbConjugations)) {
    const regex = new RegExp(`\\b(\\S+)${bangla}\\b`, "g")
    text = text.replace(regex, (match, word) => `${word}${hindi}`)
  }

  // Add more complex grammatical rules
  const complexRules: { [key: string]: string } = {
    "যদি(.+)তাহলে": "अगर$1तो",
    "যতক্ষণ না(.+)ততক্ষণ": "जब तक$1तब तक",
    "যেহেতু(.+)সেহেতু": "चूंकि$1इसलिए",
    "যত(.+)তত": "जितना$1उतना",
  }

  for (const [bangla, hindi] of Object.entries(complexRules)) {
    const regex = new RegExp(bangla, "g")
    text = text.replace(regex, hindi)
  }

  return text
}

export async function transliterateBanglaToHindi(text: string): Promise<string> {
  // First, check for common words and idioms
  for (const [bangla, hindi] of Object.entries(commonWords)) {
    const regex = new RegExp(`\\b${bangla}\\b`, "g")
    text = text.replace(regex, hindi)
  }
  text = handleIdioms(text)

  // Then, handle conjuncts
  for (const [bangla, hindi] of Object.entries(banglaConjuncts)) {
    text = text.replace(new RegExp(bangla, "g"), hindi)
  }

  // Apply phonetic rules
  text = applyPhoneticRules(text)

  // Handle grammatical structures
  text = handleGrammaticalStructures(text)

  // Handle special cases
  text = handleSpecialCases(text)

  // Split the text into sentences
  const sentences = text.match(/[^।]+।/g) || [text]

  let transliteratedText = ""
  for (const sentence of sentences) {
    // Check if the sentence contains any complex structures or idioms
    if (sentence.match(/যদি|যতক্ষণ|যেহেতু|যত|নাকে কাঁদা|মাথা খারাপ|চোখে ধুলো|কানে তুলো|পেটে পেটে/)) {
      // Use advanced NLP for complex sentences and idioms
      const complexHandled = await advancedNLP.handleComplexStructure(sentence)
      transliteratedText += complexHandled + " "
    } else {
      // For simpler sentences, use character-by-character transliteration
      transliteratedText +=
        sentence
          .split("")
          .map((char) => banglaToHindiMap[char] || char)
          .join("") + " "
    }
  }

  // Use the ML model for final refinement, but handle potential errors
  try {
    const mlRefined = await transcriptionModel.transcribe(transliteratedText.trim())
    return mlRefined
  } catch (error) {
    console.error("Error using ML model for refinement:", error)
    // If the ML model fails, return the rule-based transliteration
    return transliteratedText.trim()
  }
}

