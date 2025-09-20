import { useState } from "react"
import { clsx } from "clsx"
import { languages } from "./languages"
import { getFarewellText, getRandomWord } from "./utils"
import Confetti from "react-confetti"
import type {JSX} from "react"
import type {Language} from "./languages"



export default function AssemblyEndgame(): JSX.Element {
    // State values
    const [currentWord, setCurrentWord] = useState<string>(():string => getRandomWord())
    const [guessedLetters, setGuessedLetters] = useState<string[]>([])

    // Derived values
    const numGuessesLeft: number = languages.length - 1
    const wrongGuessCount: number =
        guessedLetters.filter((letter: string): boolean => !currentWord.includes(letter)).length
    const isGameWon: boolean =
        currentWord.split("").every((letter: string): boolean => guessedLetters.includes(letter))
    const isGameLost: boolean = wrongGuessCount >= numGuessesLeft
    const isGameOver: boolean = isGameWon || isGameLost
    const lastGuessedLetter: string = guessedLetters[guessedLetters.length - 1]
    const isLastGuessIncorrect: boolean | "" = lastGuessedLetter && !currentWord.includes(lastGuessedLetter)

    // Static values
    const alphabet = "abcdefghijklmnopqrstuvwxyz"

    function addGuessedLetter(letter: string): void {
        setGuessedLetters( prevLetters =>
            prevLetters.includes(letter) ?
                prevLetters :
                [...prevLetters, letter]
        )
    }

    function startNewGame(): void {
        setCurrentWord(getRandomWord())
        setGuessedLetters([])
    }

    function LostAnimation({ count = 16 }: {count: number}): JSX.Element {
        const crying: JSX.Element[] = Array.from({ length: count }).map((_, i) => {
            const left: number = Math.round(Math.random() * 100)
            const delay: string = (Math.random() * 1.5).toFixed(2)
            const duration: string = (3 + Math.random() * 3).toFixed(2)
            const size: number = 12 + Math.round(Math.random() * 36)
            return (
                <span
                    key={i}
                    className="crying"
                    style={{
                        left: `${left}%`,
                        animationDelay: `${delay}s`,
                        animationDuration: `${duration}s`,
                        fontSize: `${size}px`
                    }}
                >
                    😢
                </span>
            )
        })

        return <div className="crying-rain" aria-hidden="true">{crying}</div>
    }


    const languageElements: JSX.Element[] = languages.map((lang:Language, index:number):JSX.Element => {
        const isLanguageLost: boolean = index < wrongGuessCount
        const styles:Omit<Language, "name"> = {
            backgroundColor: lang.backgroundColor,
            color: lang.color
        }
        const className: string = clsx("chip", isLanguageLost && "lost")
        return (
            <span
                className={className}
                style={styles}
                key={lang.name}
            >
                {lang.name}
            </span>
        )
    })

    const letterElements:JSX.Element[] = currentWord.split("").map((letter: string, index: number): JSX.Element => {
        const shouldRevealLetter: boolean = isGameLost || guessedLetters.includes(letter)
        const letterClassName: string = clsx(
            isGameLost && !guessedLetters.includes(letter) && "missed-letter"
        )
        return (
            <span key={index} className={letterClassName}>
                {shouldRevealLetter ? letter.toUpperCase() : ""}
            </span>
        )
    })

    const keyboardElements:JSX.Element[] = alphabet.split("").map((letter:string):JSX.Element => {
        const isGuessed: boolean = guessedLetters.includes(letter)
        const isCorrect: boolean = isGuessed && currentWord.includes(letter)
        const isWrong: boolean = isGuessed && !currentWord.includes(letter)
        const className: string = clsx({
            correct: isCorrect,
            wrong: isWrong
        })

        return (
            <button
                className={className}
                key={letter}
                disabled={isGameOver}
                aria-disabled={guessedLetters.includes(letter)}
                aria-label={`Letter ${letter}`}
                onClick={() => addGuessedLetter(letter)}
            >
                {letter.toUpperCase()}
            </button>
        )
    })

    const gameStatusClass: string = clsx("game-status", {
        won: isGameWon,
        lost: isGameLost,
        farewell: !isGameOver && isLastGuessIncorrect
    })

    function renderGameStatus(): JSX.Element | null {
        if (!isGameOver && isLastGuessIncorrect) {
            return (
                <p className="farewell-message">
                    {getFarewellText(languages[wrongGuessCount - 1].name)}
                </p>
            )
        }

        if (isGameWon) {
            return (
                <>
                    <h2>You win!</h2>
                    <p>Well done! 🎉</p>
                </>
            )
        }
        if (isGameLost) {
            return (
                <>
                    <h2>Game over!</h2>
                    <p>You lose! Better start learning Assembly 😭</p>
                </>
            )
        }

        return null
    }

    return (
        <main className={isGameLost ? "lost-shake" : ""}>
            {
                isGameWon && 
                    <Confetti
                        recycle={false}
                        numberOfPieces={1000}
                    />
            }
            {isGameLost && LostAnimation({count:24})}
            <header>
                <h1>Assembly: Endgame</h1>
                <p>Guess the word within 8 attempts to keep the
                programming world safe from Assembly!</p>
            </header>

            <section
                aria-live="polite"
                role="status"
                className={gameStatusClass}
            >
                {renderGameStatus()}
            </section>

            <section className="language-chips">
                {languageElements}
            </section>

            <section className="word">
                {letterElements}
            </section>

            {/* Combined visually-hidden aria-live region for status updates */}
            <section
                className="sr-only"
                aria-live="polite"
                role="status"
            >
                <p>
                    {currentWord.includes(lastGuessedLetter) ?
                        `Correct! The letter ${lastGuessedLetter} is in the word.` :
                        `Sorry, the letter ${lastGuessedLetter} is not in the word.`
                    }
                    You have {numGuessesLeft} attempts left.
                </p>
                <p>Current word: {currentWord.split("").map((letter:string):string =>
                    guessedLetters.includes(letter) ? letter + "." : "blank.")
                    .join(" ")}</p>

            </section>

            <section className="keyboard">
                {keyboardElements}
            </section>

            {!isGameOver && 
                <section className="attempts-left">
                    <p>You have { numGuessesLeft - wrongGuessCount } guesses left.</p>
                </section>}

            {isGameOver &&
                <button
                    className="new-game"
                    onClick={startNewGame}
                >New Game</button>}
        </main>
    )
}
