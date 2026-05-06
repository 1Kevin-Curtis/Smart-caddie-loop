import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function diagnose(round) {
  let shortRight = 0;
  let penalties = 0;
  let threePutts = 0;
  let missedGIR = 0;

  round.forEach((h) => {
    if (h.tags.includes("Missed short")) shortRight++;
    if (h.tags.includes("Missed right")) shortRight++;
    if (h.tags.includes("Penalty")) penalties++;
    if (h.tags.includes("3-putt")) threePutts++;
    if (!h.tags.includes("GIR")) missedGIR++;
  });

  const leaks = [];

  if (shortRight >= 2) {
    leaks.push({
      key: "Approach play",
      score: shortRight,
      detail: "Repeated short/right misses suggest under-clubbing or conservative target choice."
    });
  }

  if (penalties >= 1) {
    leaks.push({
      key: "Tee shots",
      score: penalties + 1,
      detail: "Penalty shots are creating avoidable doubles."
    });
  }

  if (threePutts >= 1) {
    leaks.push({
      key: "Putting",
      score: threePutts,
      detail: "Distance control is costing you shots."
    });
  }

  if (missedGIR >= 2) {
    leaks.push({
      key: "Greens in regulation",
      score: missedGIR,
      detail: "Missing too many greens is putting pressure on short game and putting."
    });
  }

  leaks.sort((a, b) => b.score - a.score);

  if (leaks.length === 0) {
    leaks.push({
      key: "Course management",
      score: 1,
      detail: "No major leak detected. Focus on simple, repeatable decisions."
    });
  }

  return leaks.slice(0, 2);
}

function advice(leaks) {
  return leaks.map((l) => {
    if (l.key === "Approach play") {
      return {
        title: "Take +1 club, aim centre",
        body: "Your approach miss pattern suggests you are leaving shots short/right. Club up and aim at the safest part of the green."
      };
    }

    if (l.key === "Tee shots") {
      return {
        title: "Use hybrid on tight holes",
        body: "When there is trouble right or the fairway feels narrow, keep driver in the bag and remove the double bogey risk."
      };
    }

    if (l.key === "Putting") {
      return {
        title: "Lag to a 3ft zone",
        body: "Your first putt target is speed control. Think tap-in range, not holing everything."
      };
    }

    if (l.key === "Greens in regulation") {
      return {
        title: "Aim centre of green",
        body: "Do not chase tucked pins. Hit the biggest safe target and give yourself a putt."
      };
    }

    return {
      title: "Play simple",
      body: "Choose the shot that removes the worst miss."
    };
  });
}

function Button({ children, onClick, secondary }) {
  return (
    <button onClick={onClick} className={secondary ? "button secondary" : "button"}>
      {children}
    </button>
  );
}

function Phone({ children }) {
  return (
    <main className="page">
      <section className="phone">
        <div className="notch" />
        <div className="screen">{children}</div>
      </section>
    </main>
  );
}

function Tag({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={active ? "tag active" : "tag"}>
      {label}
    </button>
  );
}

function Card({ children, dark }) {
  return <div className={dark ? "card dark" : "card"}>{children}</div>;
}

function Home({ start }) {
  return (
    <Phone>
      <div className="stack hero">
        <div className="appIcon">⛳</div>
        <h1>Smart Caddie Loop</h1>
        <p className="lead">Simulate three holes and get a practical Next Round Plan.</p>
        <Card>
          <p className="eyebrow">Prototype test</p>
          <p>Use realistic outcomes from your last few rounds. This is testing whether the advice feels useful enough to try next time you play.</p>
        </Card>
        <Button onClick={start}>Start simulation</Button>
      </div>
    </Phone>
  );
}

function Hole({ hole, total, tags, toggleTag, next }) {
  const options = ["GIR", "Missed short", "Missed right", "Penalty", "3-putt"];
  return (
    <Phone>
      <div className="stack">
        <div>
          <p className="eyebrow">Hole {hole} of {total}</p>
          <h2>What happened?</h2>
          <p className="muted">Keep it simple. Tap the things that applied to this hole.</p>
        </div>
        <div className="tagGrid">
          {options.map((tag) => (
            <Tag key={tag} label={tag} active={tags.includes(tag)} onClick={() => toggleTag(tag)} />
          ))}
        </div>
        <Card>
          <p className="eyebrow">Selected</p>
          <p>{tags.length ? tags.join(", ") : "No tags selected yet"}</p>
        </Card>
        <Button onClick={next}>{hole < total ? "Next hole" : "Finish round"}</Button>
      </div>
    </Phone>
  );
}

function Summary({ leaks, createPlan, restart }) {
  return (
    <Phone>
      <div className="stack">
        <div>
          <p className="eyebrow">Round summary</p>
          <h2>Here’s what cost you shots</h2>
          <p className="muted">The prototype uses a simple rule engine to identify your top two leaks.</p>
        </div>
        {leaks.map((leak) => (
          <Card key={leak.key}>
            <h3>{leak.key}</h3>
            <p>{leak.detail}</p>
          </Card>
        ))}
        <Button onClick={createPlan}>Create Next Round Plan</Button>
        <Button secondary onClick={restart}>Restart</Button>
      </div>
    </Phone>
  );
}

function Plan({ tips, nextPrompt, restart }) {
  return (
    <Phone>
      <div className="stack">
        <div>
          <p className="eyebrow">Next Round Plan</p>
          <h2>Three rules. No clutter.</h2>
          <p className="muted">The goal is to give you something simple enough to remember on the course.</p>
        </div>
        {tips.map((tip, index) => (
          <Card dark key={tip.title}>
            <p className="eyebrow light">Rule {index + 1}</p>
            <h3>{tip.title}</h3>
            <p>{tip.body}</p>
          </Card>
        ))}
        <Card>
          <h3>Mindset rule</h3>
          <p>Protect against doubles. Your quickest route to lower scores is removing blow-up holes.</p>
        </Card>
        <Button onClick={nextPrompt}>Simulate smart prompt</Button>
        <Button secondary onClick={restart}>Restart</Button>
      </div>
    </Phone>
  );
}

function Prompt({ tips, restart }) {
  const tip = tips[0] || { title: "Play simple", body: "Choose the shot that removes the worst miss." };
  return (
    <Phone>
      <div className="stack hero">
        <Card dark>
          <p className="eyebrow light">Smart prompt</p>
          <h2>{tip.title}</h2>
          <p>{tip.body}</p>
        </Card>
        <Card>
          <p className="eyebrow">Testing question</p>
          <p>Would you trust this enough to follow it in your next real round?</p>
        </Card>
        <Button onClick={restart}>Restart prototype</Button>
      </div>
    </Phone>
  );
}

function App() {
  const [screen, setScreen] = useState("home");
  const [currentHole, setCurrentHole] = useState(0);
  const [round, setRound] = useState([
    { hole: 1, tags: [] },
    { hole: 2, tags: [] },
    { hole: 3, tags: [] }
  ]);

  const leaks = useMemo(() => diagnose(round), [round]);
  const tips = useMemo(() => advice(leaks), [leaks]);

  function reset() {
    setScreen("home");
    setCurrentHole(0);
    setRound([{ hole: 1, tags: [] }, { hole: 2, tags: [] }, { hole: 3, tags: [] }]);
  }

  function toggleTag(tag) {
    setRound((previous) => {
      const updated = previous.map((hole) => ({ ...hole, tags: [...hole.tags] }));
      const tags = updated[currentHole].tags;
      updated[currentHole].tags = tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag];
      return updated;
    });
  }

  function nextHole() {
    if (currentHole < round.length - 1) setCurrentHole(currentHole + 1);
    else setScreen("summary");
  }

  if (screen === "home") return <Home start={() => setScreen("hole")} />;
  if (screen === "hole") return <Hole hole={currentHole + 1} total={round.length} tags={round[currentHole].tags} toggleTag={toggleTag} next={nextHole} />;
  if (screen === "summary") return <Summary leaks={leaks} createPlan={() => setScreen("plan")} restart={reset} />;
  if (screen === "plan") return <Plan tips={tips} nextPrompt={() => setScreen("prompt")} restart={reset} />;
  if (screen === "prompt") return <Prompt tips={tips} restart={reset} />;
  return <Home start={() => setScreen("hole")} />;
}

createRoot(document.getElementById("root")).render(<App />);
