import React, { useState, useEffect } from "react";

function ProgressBar({ timer }) {
  const [percent, setPercent] = useState("");

  useEffect(() => {
    const intervalID = setInterval(() => {
      setPercent(timer.PercentDone());
    }, 100);

    return () => {
      clearInterval(intervalID);
    };
  });

  return (
    <progress value={percent}>
      {Math.floor(timer.TimeRemaining() / 1000)}
    </progress>
  );
}

export default ProgressBar;
