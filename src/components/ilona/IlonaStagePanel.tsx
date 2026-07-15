import {
  memo,
  useMemo,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { PixelPosition } from "./ilonaEffects";
import { STAGES, type Stage } from "./ilonaStages";

const correctButtonClass =
  "rounded-lg bg-gradient-to-r from-pink-300 to-cyan-200 px-2.5 py-2 text-base font-black text-[#23091f] shadow-[0_14px_40px_rgba(255,143,189,0.32)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(103,232,249,0.26)] focus:outline-none focus:ring-2 focus:ring-white sm:px-5 sm:py-4 sm:text-xl";

type ActivateRunaway = (
  sourceElement?: HTMLElement,
  pointer?: PixelPosition | null,
  action?: "escape" | "teleport",
  answer?: string,
) => void;

type IlonaStagePanelProps = {
  activateRunaway: ActivateRunaway;
  activeWrongAnswer: string;
  attempts: number;
  currentStage: Stage;
  handleCorrectAnswer: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  handleWrongInlineKeyDown: (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    answer: string,
  ) => void;
  handleWrongInlinePointerDown: (
    event: ReactPointerEvent<HTMLButtonElement>,
    answer: string,
  ) => void;
  handleWrongInlinePointerEnter: (
    event: ReactPointerEvent<HTMLButtonElement>,
    answer: string,
  ) => void;
  stage: number;
  wrongEscaped: boolean;
};

export const IlonaStagePanel = memo(
  ({
    activateRunaway,
    activeWrongAnswer,
    attempts,
    currentStage,
    handleCorrectAnswer,
    handleWrongInlineKeyDown,
    handleWrongInlinePointerDown,
    handleWrongInlinePointerEnter,
    stage,
    wrongEscaped,
  }: IlonaStagePanelProps) => {
    const answers = useMemo(() => {
      const correctAnswerSet = new Set(currentStage.correctAnswers);
      const answerOrder = currentStage.answerOrder ?? [
        ...currentStage.correctAnswers,
        ...currentStage.wrongAnswers,
      ];

      return answerOrder.map((answer) => ({
        answer,
        correct: correctAnswerSet.has(answer),
      }));
    }, [currentStage]);
    const reaction = useMemo(
      () =>
        attempts === 0
          ? currentStage.idleLine
          : currentStage.taunts[(attempts - 1) % currentStage.taunts.length],
      [attempts, currentStage],
    );
    const answerGridClass =
      answers.length >= 8
        ? "grid-cols-5"
        : answers.length >= 4
          ? "grid-cols-4"
          : answers.length === 3
            ? "grid-cols-1 sm:grid-cols-3"
            : "grid-cols-2";

    return (
      <div className="text-center">
        <div className="ilona-stage-panel mb-2 flex items-center justify-center gap-1.5 sm:mb-4 sm:gap-2">
          {STAGES.map((item, index) => (
            <span
              key={item.badge}
              className={`h-2 rounded-full transition-all sm:h-2.5 ${
                index === stage
                  ? "w-7 bg-pink-200 sm:w-9"
                  : "w-2 bg-white/25 sm:w-2.5"
              }`}
            />
          ))}
        </div>

        <p className="ilona-stage-panel mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/70 sm:mb-3 sm:text-xs sm:tracking-[0.24em]">
          {currentStage.badge}
        </p>
        <h1 className="ilona-stage-panel text-2xl font-black text-pink-100 drop-shadow-[0_0_28px_rgba(255,143,189,0.45)] sm:text-4xl">
          {currentStage.title}
        </h1>

        <div className="ilona-stage-panel mx-auto mt-3 max-w-xl rounded-lg border border-white/10 bg-black/20 p-3 text-right sm:mt-5 sm:p-5">
          <p className="text-xs font-bold text-pink-100/55 sm:text-sm">
            בחרי בזהירות
          </p>
          <p className="mt-2 text-lg font-bold leading-snug text-white sm:mt-3 sm:text-2xl">
            {currentStage.question}
          </p>
          <p className="mt-2 text-xs font-semibold leading-5 text-cyan-100/70 sm:mt-3 sm:text-sm">
            {currentStage.note}
          </p>
        </div>

        <div
          className={`ilona-stage-panel mx-auto mt-3 grid max-w-xl gap-2 sm:mt-6 sm:gap-3 ${answerGridClass}`}
        >
          {answers.map(({ answer, correct }) =>
            correct ? (
              <button
                key={answer}
                type="button"
                data-ilona-correct="true"
                onClick={handleCorrectAnswer}
                className={correctButtonClass}
              >
                {answer}
              </button>
            ) : wrongEscaped && activeWrongAnswer === answer ? (
              <span
                key={answer}
                aria-hidden
                className={`${correctButtonClass} invisible block`}
              >
                {answer}
              </span>
            ) : (
              <button
                key={answer}
                type="button"
                onFocus={(event) =>
                  activateRunaway(
                    event.currentTarget,
                    null,
                    "escape",
                    answer,
                  )
                }
                onKeyDown={(event) =>
                  handleWrongInlineKeyDown(event, answer)
                }
                onPointerDown={(event) =>
                  handleWrongInlinePointerDown(event, answer)
                }
                onPointerEnter={(event) =>
                  handleWrongInlinePointerEnter(event, answer)
                }
                className={correctButtonClass}
              >
                {answer}
              </button>
            ),
          )}
        </div>

        <p className="ilona-stage-panel mt-3 min-h-5 text-xs font-bold leading-5 text-pink-100/70 sm:mt-5 sm:min-h-6 sm:text-sm">
          {reaction}
        </p>

        <p className="ilona-stage-panel mt-1.5 text-[10px] font-semibold text-white/35 sm:mt-3 sm:text-xs">
          אזהרת מערכת: תשובות מוגזמות נלחצות ומאבדות כיוון, עדיין ניתן לנסות
          ללחוץ עליהם.
        </p>
      </div>
    );
  },
);
