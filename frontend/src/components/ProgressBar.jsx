import React, { useState, useEffect } from "react";

function ProgressBar({ timer }) {
  const [percent, setPercent] = useState("");
  const [timeLeftMin, setTimeLeftMin] = useState("");
  const [timeLeftSec, setTimeLeftSec] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      setPercent(timer.PercentDone());
      const totalSec = Math.ceil(timer.TimeRemaining() / 1000);
      setTimeLeftMin(Math.floor(totalSec / 60));
      setTimeLeftSec(totalSec % 60);

      setIsDone(timer.IsDone());
    };
    updateTimer();
    const intervalID = setInterval(updateTimer, 100);

    return () => clearInterval(intervalID);
  }, [timer]);

  return (
    <div className="progress-container">
      <progress value={percent}/>
      <div className="time-remaining">
        {(timeLeftMin > 0 || timeLeftSec > 0) ? `${timeLeftMin}m ${timeLeftSec.toString().padStart(2,"0")}s remaining` : isDone ? "Done!" : ""}
      </div>
    </div>
  );
}

export default ProgressBar;
