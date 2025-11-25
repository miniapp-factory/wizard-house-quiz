"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

type House = "Gryffindor" | "Hufflepuff" | "Ravenclaw" | "Slytherin";

interface Option {
  text: string;
  house: House;
}

interface Question {
  prompt: string;
  options: Option[];
}

const questions: Question[] = [
  {
    prompt: "How do you approach challenges?",
    options: [
      { text: "Face them bravely and act fast.", house: "Gryffindor" },
      { text: "Stay patient and work through them steadily.", house: "Hufflepuff" },
      { text: "Analyze the problem and plan smartly.", house: "Ravenclaw" },
      { text: "Look for a clever strategy or advantage.", house: "Slytherin" },
    ],
  },
  {
    prompt: "What do people like most about you?",
    options: [
      { text: "Your boldness and strong will.", house: "Gryffindor" },
      { text: "Your loyalty and dependability.", house: "Hufflepuff" },
      { text: "Your creativity and intelligence.", house: "Ravenclaw" },
      { text: "Your ambition and leadership energy.", house: "Slytherin" },
    ],
  },
  {
    prompt: "Which activity sounds fun?",
    options: [
      { text: "Adventuring or thrilling challenges.", house: "Gryffindor" },
      { text: "Helping others or doing teamwork tasks.", house: "Hufflepuff" },
      { text: "Reading, puzzles, or solving mysteries.", house: "Ravenclaw" },
      { text: "Debating, planning, or competing to win.", house: "Slytherin" },
    ],
  },
  {
    prompt: "How do you react when someone is being treated unfairly?",
    options: [
      { text: "Step in immediately to defend them.", house: "Gryffindor" },
      { text: "Support them quietly but consistently.", house: "Hufflepuff" },
      { text: "Find the smartest, most effective solution.", house: "Ravenclaw" },
      { text: "Shift the situation using strategy.", house: "Slytherin" },
    ],
  },
  {
    prompt: "What kind of success matters most to you?",
    options: [
      { text: "Doing what is right no matter the cost.", house: "Gryffindor" },
      { text: "Staying loyal and true while helping others.", house: "Hufflepuff" },
      { text: "Gaining knowledge and mastering skills.", house: "Ravenclaw" },
      { text: "Achieving big goals and reaching high status.", house: "Slytherin" },
    ],
  },
];

const personality: Record<House, string> = {
  Gryffindor:
    "You’re courageous, bold, and full of determination. You stand up for what’s right and inspire those around you.",
  Hufflepuff:
    "You’re loyal, patient, and hardworking. You value fairness, kindness, and staying true to the people you care about.",
  Ravenclaw:
    "You’re intelligent, curious, and creative. You love learning new things and seeing patterns others often miss.",
  Slytherin:
    "You’re ambitious, strategic, and resourceful. You set big goals and find clever ways to achieve them.",
};

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Quiz() {
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState<Record<House, number>>({
    Gryffindor: 0,
    Hufflepuff: 0,
    Ravenclaw: 0,
    Slytherin: 0,
  });
  const [showResult, setShowResult] = useState(false);
  const [winner, setWinner] = useState<House | null>(null);

  useEffect(() => {
    const qs = questions.map((q) => ({
      ...q,
      options: shuffle(q.options),
    }));
    setShuffledQuestions(shuffle(qs));
  }, []);

  const handleAnswer = (house: House) => {
    setScores((prev) => ({ ...prev, [house]: prev[house] + 1 }));
    if (current + 1 < shuffledQuestions.length) {
      setCurrent(current + 1);
    } else {
      determineWinner();
    }
  };

  const determineWinner = () => {
    const maxScore = Math.max(...Object.values(scores));
    const topHouses = Object.entries(scores)
      .filter(([, s]) => s === maxScore)
      .map(([h]) => h as House);

    let finalWinner: House;
    if (topHouses.length === 1) {
      finalWinner = topHouses[0];
    } else {
      // tie breaker: answer to question 5
      const q5 = shuffledQuestions[4];
      const chosen = q5.options.find((o) => o.house === topHouses[0])?.house;
      if (chosen && topHouses.includes(chosen)) {
        finalWinner = chosen;
      } else {
        // still tied, pick random
        finalWinner = topHouses[Math.floor(Math.random() * topHouses.length)];
      }
    }
    setWinner(finalWinner);
    setShowResult(true);
  };

  const retake = () => {
    setScores({
      Gryffindor: 0,
      Hufflepuff: 0,
      Ravenclaw: 0,
      Slytherin: 0,
    });
    setCurrent(0);
    setShowResult(false);
    setWinner(null);
    setShuffledQuestions(
      questions.map((q) => ({
        ...q,
        options: shuffle(q.options),
      }))
    );
  };

  if (shuffledQuestions.length === 0) return null;

  if (showResult && winner) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold">You belong to: {winner}!</h2>
        <img
          src={`/${winner.toLowerCase()}.png`}
          alt={winner}
          width={512}
          height={512}
          className="rounded"
        />
        <p className="text-center max-w-md">{personality[winner]}</p>
        <div className="flex gap-4">
          <Button onClick={retake}>Retake Quiz</Button>
          <Share
            text={`I got ${winner}! Which wizard house do you belong to?`}
          />
        </div>
      </div>
    );
  }

  const q = shuffledQuestions[current];
  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-xl font-semibold">{q.prompt}</h3>
      <div className="flex flex-col gap-2">
        {q.options.map((opt, idx) => (
          <Button
            key={idx}
            variant="outline"
            onClick={() => handleAnswer(opt.house)}
          >
            {opt.text}
          </Button>
        ))}
      </div>
    </div>
  );
}
