"use client";

export const PASSWORD_MIN = 8;

function Tick() {
  return (
    <span className="au-tick" aria-hidden="true">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 6.2l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** Live password guidance. Only the length rule is required (it matches the API). */
export function PasswordChecklist({ id, password, confirm }: { id: string; password: string; confirm?: string }) {
  const rules = [
    { label: `At least ${PASSWORD_MIN} characters`, met: password.length >= PASSWORD_MIN },
    { label: "Letters and numbers", met: /[a-z]/i.test(password) && /\d/.test(password) },
    { label: "An uppercase letter or a symbol", met: /[A-Z]/.test(password) || /[^a-z0-9]/i.test(password) },
  ];
  const score = rules.filter((r) => r.met).length;
  const strength = password.length === 0 ? null : score <= 1 ? "Weak" : score === 2 ? "Fair" : "Strong";
  const colour = strength === "Strong" ? "var(--sw-green)" : strength === "Fair" ? "var(--sw-gold)" : "var(--sw-clay)";
  const width = password.length === 0 ? 0 : Math.max(12, (score / 3) * 100);

  return (
    <div id={id} className="au-strength">
      <div className="au-strength-head">
        <span>Password strength</span>
        <b
          aria-live="polite"
          style={{ color: strength === "Strong" ? "var(--sw-accent)" : strength === "Fair" ? "var(--sw-gold-ink)" : "var(--sw-clay-ink)" }}
        >
          {strength}
        </b>
      </div>
      <div className="au-meter" aria-hidden="true">
        <span style={{ width: `${width}%`, background: colour }} />
      </div>
      <ul className="au-rules">
        {rules.map((rule) => (
          <li key={rule.label} className="au-rule" data-met={rule.met ? "" : undefined}>
            <Tick />
            <span>
              {rule.label}
              <span className="au-sr">{rule.met ? ": done" : ": not yet"}</span>
            </span>
          </li>
        ))}
        {confirm !== undefined && confirm.length > 0 && (
          <li
            className="au-rule"
            data-met={confirm === password ? "" : undefined}
            data-bad={confirm !== password ? "" : undefined}
          >
            <Tick />
            {confirm === password ? "Passwords match" : "Passwords don't match yet"}
          </li>
        )}
      </ul>
    </div>
  );
}
