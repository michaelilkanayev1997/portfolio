import {
  memo,
  useCallback,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import type { PixelPosition } from "./ilonaEffects";
import type { Stage } from "./ilonaStages";
import { IlonaCompletionPanel } from "./IlonaCompletionPanel";
import { IlonaStagePanel } from "./IlonaStagePanel";

const runawayButtonClass =
  "absolute left-0 top-0 z-[1200] min-w-16 rounded-lg border border-white/20 bg-white/12 px-3 py-2 text-center text-base font-black text-pink-50 shadow-[0_18px_50px_rgba(0,0,0,0.36)] backdrop-blur-xl transition-colors will-change-transform hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-pink-200 sm:min-w-20 sm:px-5 sm:py-3 sm:text-xl";

type ActivateRunaway = (
  sourceElement?: HTMLElement,
  pointer?: PixelPosition | null,
  action?: "escape" | "teleport",
  answer?: string,
) => void;

type IlonaOverlayProps = {
  activateRunaway: ActivateRunaway;
  activeWrongAnswer: string;
  attempts: number;
  cardRef: RefObject<HTMLDivElement | null>;
  close: () => void;
  completed: boolean;
  currentStage: Stage;
  fieldRef: RefObject<HTMLDivElement | null>;
  getPointerInOverlay: (
    event: ReactPointerEvent<HTMLElement>,
  ) => PixelPosition | null;
  handleCorrectAnswer: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  handleRevealSecret: () => void;
  moveWrongAnswer: (
    pointer: PixelPosition | null,
    dramatic?: boolean,
    force?: boolean,
  ) => void;
  onWrongKeyboardAttempt: () => void;
  overlayRef: RefObject<HTMLDivElement | null>;
  playWrongJoke: (
    event?: ReactPointerEvent<HTMLElement>,
    answer?: string,
  ) => void;
  secretRevealed: boolean;
  stage: number;
  wrongButtonRef: RefObject<HTMLButtonElement | null>;
  wrongEscaped: boolean;
};

export const IlonaOverlay = memo(
  ({
    activateRunaway,
    activeWrongAnswer,
    attempts,
    cardRef,
    close,
    completed,
    currentStage,
    fieldRef,
    getPointerInOverlay,
    handleCorrectAnswer,
    handleRevealSecret,
    moveWrongAnswer,
    onWrongKeyboardAttempt,
    overlayRef,
    playWrongJoke,
    secretRevealed,
    stage,
    wrongButtonRef,
    wrongEscaped,
  }: IlonaOverlayProps) => {
    const handleOverlayPointerMove = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        const wrongButton = wrongButtonRef.current;
        if (!wrongButton || completed || !wrongEscaped) return;

        const rect = wrongButton.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(
          event.clientX - centerX,
          event.clientY - centerY,
        );

        if (distance < 190) {
          moveWrongAnswer(getPointerInOverlay(event), false);
        }
      },
      [
        completed,
        getPointerInOverlay,
        moveWrongAnswer,
        wrongButtonRef,
        wrongEscaped,
      ],
    );

    const handleWrongInlinePointerEnter = useCallback(
      (event: ReactPointerEvent<HTMLButtonElement>, answer: string) => {
        activateRunaway(
          event.currentTarget,
          getPointerInOverlay(event),
          "escape",
          answer,
        );
      },
      [activateRunaway, getPointerInOverlay],
    );

    const handleWrongInlinePointerDown = useCallback(
      (event: ReactPointerEvent<HTMLButtonElement>, answer: string) => {
        event.preventDefault();
        event.stopPropagation();
        playWrongJoke(event, answer);
      },
      [playWrongJoke],
    );

    const handleWrongInlineKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLButtonElement>, answer: string) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        activateRunaway(event.currentTarget, null, "teleport", answer);
        onWrongKeyboardAttempt();
      },
      [activateRunaway, onWrongKeyboardAttempt],
    );

    const handleWrongPointerDown = useCallback(
      (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        playWrongJoke(event);
      },
      [playWrongJoke],
    );

    const handleWrongKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        playWrongJoke();
      },
      [playWrongJoke],
    );

    return (
      <div
        ref={overlayRef}
        aria-modal="true"
        className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-[#100716] p-1.5 text-white sm:p-4"
        dir="rtl"
        onPointerMove={handleOverlayPointerMove}
        role="dialog"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(255,106,169,0.24), transparent 33%), radial-gradient(circle at 84% 18%, rgba(103,232,249,0.15), transparent 30%), radial-gradient(circle at 60% 88%, rgba(253,230,138,0.11), transparent 28%), linear-gradient(135deg, #120714 0%, #2d0b28 46%, #0b1024 100%)",
        }}
      >
        <div
          ref={fieldRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        />

        {wrongEscaped && !completed && (
          <button
            key={`runaway-${stage}`}
            ref={wrongButtonRef}
            type="button"
            onFocus={() => moveWrongAnswer(null, false, true)}
            onKeyDown={handleWrongKeyDown}
            onPointerDown={handleWrongPointerDown}
            onPointerEnter={(event) =>
              moveWrongAnswer(getPointerInOverlay(event), false, true)
            }
            style={{ opacity: 0 }}
            className={runawayButtonClass}
          >
            {activeWrongAnswer}
          </button>
        )}

        <div
          ref={cardRef}
          className="relative z-10 w-full max-w-xl overflow-hidden rounded-lg border border-pink-200/20 bg-white/[0.075] p-3 text-right shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:max-w-2xl sm:p-6"
        >
          <button
            type="button"
            onClick={close}
            className="absolute left-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-pink-100 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink-200/60 sm:left-4 sm:top-4 sm:h-9 sm:w-9"
            aria-label="סגירת המשחק של אילונה"
          >
            <span aria-hidden className="text-xl leading-none">
              x
            </span>
          </button>

          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-200/70 to-transparent" />

          {completed ? (
            <IlonaCompletionPanel
              close={close}
              handleRevealSecret={handleRevealSecret}
              secretRevealed={secretRevealed}
            />
          ) : (
            <IlonaStagePanel
              activateRunaway={activateRunaway}
              activeWrongAnswer={activeWrongAnswer}
              attempts={attempts}
              currentStage={currentStage}
              handleCorrectAnswer={handleCorrectAnswer}
              handleWrongInlineKeyDown={handleWrongInlineKeyDown}
              handleWrongInlinePointerDown={handleWrongInlinePointerDown}
              handleWrongInlinePointerEnter={handleWrongInlinePointerEnter}
              stage={stage}
              wrongEscaped={wrongEscaped}
            />
          )}
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 shadow-[inset_0_0_130px_rgba(0,0,0,0.58)]"
        />
      </div>
    );
  },
);
