import { nanoid } from "nanoid";
import * as React from "react";

type TimePickerProps = {
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  minTime?: string;
  maxTime?: string;
  required?: boolean;
  id?: string;
  disabled?: boolean;
  name?: string;
  step?: number;
  list?: string;
  className?: string;
};

export default function TimePicker({
  value,
  onChange,
  minTime = "00:00",
  maxTime = "23:59",
  required = false,
  disabled = false,
  id = "",
  name = "",
  list = "times",
  step = 1800,
  className = "",
}: TimePickerProps) {
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    onChange(evt.target.value);
  };

  const generateTimeDataList = (
    minTime: string,
    maxTime: string,
    step: number,
  ) => {
    const minTimeStrings = minTime.split(":");
    const maxTimeStrings = maxTime.split(":");

    const currentTime: number[] = [];
    const maximumTime: number[] = [];
    const times: string[] = [];

    currentTime[0] = +minTimeStrings[0];
    currentTime[1] = +minTimeStrings[1];

    maximumTime[0] = +maxTimeStrings[0];
    maximumTime[1] = +maxTimeStrings[1];

    while (
      currentTime[0] < maximumTime[0] ||
      (currentTime[0] === maximumTime[0] && currentTime[1] <= maximumTime[1])
    ) {
      times.push(
        `${String(currentTime[0]).padStart(2, "0")}:${String(
          currentTime[1],
        ).padStart(2, "0")}`,
      );

      // Step <= 1 hour
      if (step / 60 / 60 <= 1) {
        currentTime[1] += step / 60;
        if (currentTime[1] >= 60) {
          currentTime[1] = currentTime[1] % 60;
          currentTime[0]++;
        }
      } else {
        // Step > 1 hour
        currentTime[0] += Math.floor(step / 60 / 60);
        currentTime[1] += (step / 60) % 60;
        if (currentTime[1] >= 60) {
          currentTime[1] = currentTime[1] % 60;
          currentTime[0]++;
        }
      }
    }

    console.log(times);
    return times;
  };

  return (
    <>
      <input
        className={className}
        id={id}
        name={name}
        type="time"
        onChange={handleChange}
        value={value}
        min={minTime}
        max={maxTime}
        required={required}
        disabled={disabled}
        list={list}
        step={step}
      />
      <datalist id={list}>
        {generateTimeDataList(minTime, maxTime, step).map((time) => {
          return <option key={nanoid()}>{time}</option>;
        })}
      </datalist>
    </>
  );
}
