import { memo } from "react";
import { FaFileSignature, FaStar } from "react-icons/fa";
import { FlowerGift } from "./FlowerGift";

type SecretPanelProps = {
  close: () => void;
};

type SuccessPanelProps = {
  handleRevealSecret: () => void;
};

type IlonaCompletionPanelProps = SecretPanelProps &
  SuccessPanelProps & {
    secretRevealed: boolean;
  };

const IlonaSecretPanel = memo(({ close }: SecretPanelProps) => (
  <div className="py-2 text-center sm:py-4">
    <div className="ilona-secret-pop relative mx-auto mb-3 grid h-12 w-12 place-items-center sm:mb-4 sm:h-16 sm:w-16">
      <span className="absolute inset-0 rounded-full bg-cyan-200/20 blur-sm" />
      <span className="absolute inset-3 rounded-full border border-pink-200/25 bg-white/10" />
      <FaStar
        aria-hidden
        className="ilona-secret-icon relative text-2xl text-pink-100 drop-shadow-[0_0_26px_rgba(255,143,189,0.65)] sm:text-3xl"
      />
    </div>

    <p className="ilona-secret-pop mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/70 sm:text-xs">
      החלק האמיתי
    </p>
    <h2 className="ilona-secret-pop text-2xl font-black text-pink-100 drop-shadow-[0_0_28px_rgba(255,143,189,0.45)] sm:text-4xl">
      כל זה היה רק הדרך להגיע לכאן
    </h2>

    <div className="ilona-secret-pop mx-auto mt-3 flex max-w-xl flex-col items-center gap-3 rounded-lg border border-pink-200/15 bg-black/20 p-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:mt-4 sm:flex-row sm:justify-between sm:gap-4 sm:p-4">
      <p className="w-full text-sm leading-6 text-pink-50/90 sm:flex-1 sm:text-base sm:leading-7">
        כל זה היה רק כדי להצחיק אותך קצת,
        <br />
        אבל גם להשאיר לך משהו קטן ואמיתי.
        <br />
        <br />
        יש לך לב טוב, רגיש ומיוחד,
        <br />
        ואני באמת שמח שאת בחיים שלי.
      </p>
      <FlowerGift />
    </div>

    <button
      type="button"
      onClick={close}
      className="ilona-secret-pop mt-4 rounded-lg bg-pink-200 px-5 py-2.5 text-sm font-bold text-[#2d0b28] shadow-[0_12px_34px_rgba(255,143,189,0.28)] transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-100 sm:mt-5 sm:py-3"
    >
      סגור
    </button>
  </div>
));

const IlonaSuccessPanel = memo(
  ({ handleRevealSecret }: SuccessPanelProps) => (
    <div className="py-1 text-center sm:py-3">
      <div className="ilona-success-pop relative mx-auto mb-2 grid h-12 w-12 place-items-center sm:mb-3 sm:h-16 sm:w-16">
        <span className="absolute inset-0 rounded-full bg-pink-300/25 animate-ping" />
        <span className="absolute inset-3 rounded-full bg-cyan-300/10" />
        <svg
          aria-hidden
          className="relative h-8 w-8 drop-shadow-[0_0_24px_rgba(255,106,169,0.65)] sm:h-10 sm:w-10"
          viewBox="0 0 32 29"
        >
          <path
            fill="#ff8fbd"
            d="M23.7 0C20.4 0 17.8 1.9 16 4.4 14.2 1.9 11.6 0 8.3 0 3.7 0 0 3.7 0 8.3c0 9.1 14.8 19.5 15.4 19.9.4.3.9.3 1.2 0C17.2 27.8 32 17.4 32 8.3 32 3.7 28.3 0 23.7 0Z"
          />
        </svg>
      </div>

      <p className="ilona-success-pop mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100/70 sm:text-xs">
        relationship agreement signed
      </p>
      <h2 className="ilona-success-pop text-xl font-black text-pink-100 drop-shadow-[0_0_28px_rgba(255,143,189,0.45)] sm:text-3xl">
        אני שמח שאנחנו מבינים אחת את השנייה
      </h2>
      <p className="ilona-success-pop mx-auto mt-2 max-w-lg text-xs leading-5 text-pink-50/85 sm:mt-3 sm:text-sm sm:leading-6">
        היה שאלון הוגן לחלוטין !
      </p>

      <div className="ilona-success-pop mx-auto mt-2 max-w-lg rounded-lg border border-white/10 bg-black/20 p-2.5 text-center sm:mt-3 sm:p-3">
        <p className="text-xs font-bold leading-5 text-cyan-50/85 sm:text-sm sm:leading-6">
          נשאר רק סעיף אחד שלא נכנס לפרוטוקול.
        </p>
      </div>

      <button
        type="button"
        onClick={handleRevealSecret}
        className="ilona-success-pop mx-auto mt-3 flex items-center justify-center gap-2 rounded-lg bg-pink-200 px-5 py-2.5 text-sm font-bold text-[#2d0b28] shadow-[0_12px_34px_rgba(255,143,189,0.28)] transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-100 sm:mt-4 sm:py-3"
      >
        <FaFileSignature aria-hidden />
        פתחי את הסעיף הסודי
      </button>
    </div>
  ),
);

export const IlonaCompletionPanel = memo(
  ({
    close,
    handleRevealSecret,
    secretRevealed,
  }: IlonaCompletionPanelProps) =>
    secretRevealed ? (
      <IlonaSecretPanel close={close} />
    ) : (
      <IlonaSuccessPanel handleRevealSecret={handleRevealSecret} />
    ),
);
