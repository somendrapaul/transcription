"use client"

import { useState, useEffect } from "react"
import { transliterateBanglaToHindi } from "./utils/transliterate"
import { transcriptionModel } from "./utils/mlModel"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function BanglaHindiTranscriptor() {
  const [banglaText, setBanglaText] = useState("")
  const [hindiText, setHindiText] = useState("")
  const [autoTranscribe, setAutoTranscribe] = useState(false)
  const [customWords, setCustomWords] = useState<{ [key: string]: string }>({})
  const [newBanglaWord, setNewBanglaWord] = useState("")
  const [newHindiWord, setNewHindiWord] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [correctedHindi, setCorrectedHindi] = useState("")

  useEffect(() => {
    if (autoTranscribe) {
      handleTranscribe()
    }
  }, [autoTranscribe]) // Removed unnecessary dependencies

  const handleTranscribe = async () => {
    let transcribed = await transliterateBanglaToHindi(banglaText)

    // Apply custom word replacements
    Object.entries(customWords).forEach(([bangla, hindi]) => {
      const regex = new RegExp(`\\b${bangla}\\b`, "g")
      transcribed = transcribed.replace(regex, hindi)
    })

    setHindiText(transcribed)
  }

  const handleAddCustomWord = () => {
    if (newBanglaWord && newHindiWord) {
      setCustomWords((prev) => ({ ...prev, [newBanglaWord]: newHindiWord }))
      setNewBanglaWord("")
      setNewHindiWord("")
    }
  }

  const handleFeedbackSubmit = async () => {
    if (correctedHindi) {
      await transcriptionModel.train(banglaText, correctedHindi)
      setShowFeedback(false)
      setCorrectedHindi("")
      // Optionally, you can re-transcribe the text after feedback
      handleTranscribe()
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Advanced Bangla to Hindi Transcription</CardTitle>
          <CardDescription>Enter Bangla text to transcribe it into Hindi script</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bangla-input" className="mb-1">
              Bangla Text
            </Label>
            <Textarea
              id="bangla-input"
              value={banglaText}
              onChange={(e) => setBanglaText(e.target.value)}
              placeholder="Enter Bangla text here..."
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="hindi-output" className="mb-1">
              Hindi Transcription
            </Label>
            <Textarea
              id="hindi-output"
              value={hindiText}
              readOnly
              placeholder="Transcribed Hindi text will appear here..."
              rows={4}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="auto-transcribe" checked={autoTranscribe} onCheckedChange={setAutoTranscribe} />
            <Label htmlFor="auto-transcribe">Auto-transcribe</Label>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Add Custom Word</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Custom Word</DialogTitle>
                <DialogDescription>
                  Add a custom Bangla word and its Hindi translation to improve transcription accuracy.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bangla-word" className="text-right">
                    Bangla
                  </Label>
                  <Input
                    id="bangla-word"
                    value={newBanglaWord}
                    onChange={(e) => setNewBanglaWord(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hindi-word" className="text-right">
                    Hindi
                  </Label>
                  <Input
                    id="hindi-word"
                    value={newHindiWord}
                    onChange={(e) => setNewHindiWord(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddCustomWord}>
                  Add Word
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Feedback</AlertTitle>
            <AlertDescription>
              Help improve our transcription by providing feedback.
              <Button variant="link" onClick={() => setShowFeedback(true)}>
                Provide Feedback
              </Button>
            </AlertDescription>
          </Alert>
          {showFeedback && (
            <div>
              <Label htmlFor="corrected-hindi" className="mb-1">
                Corrected Hindi Transcription
              </Label>
              <Textarea
                id="corrected-hindi"
                value={correctedHindi}
                onChange={(e) => setCorrectedHindi(e.target.value)}
                placeholder="Enter the correct Hindi transcription here..."
                rows={4}
              />
              <Button onClick={handleFeedbackSubmit} className="mt-2">
                Submit Feedback
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleTranscribe} className="w-full" disabled={autoTranscribe}>
            Transcribe
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

