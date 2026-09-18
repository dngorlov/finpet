# Real-calendar-day cadence in normal play; Demo mode unties the clock

## Status

accepted

## Context & decision

The doc leaves "game period" undefined but contrasts normal play with Demo mode that plays "without waiting for calendar deadlines" — implying normal play has them. We decided: a normal Игровой день unlocks on the next local calendar day (Пособие accrues on first open of a new day); in Demo mode days advance back-to-back regardless of real time.

## Considered options

- **Fully player-paced periods everywhere**: simpler, but contradicts the doc's demo-mode contrast and loses the daily-allowance pedagogy; rejected.
- **Real-time gating in demo too**: would make the mandatory 5-consecutive-period demo scenario impossible for judges; rejected.

## Consequences

- Every clock read (day unlock, allowance accrual, "today") must go through an injectable clock port; Demo mode swaps in a manual clock driven by the "next day" control.
- The demo profile is a separate profile row (`isDemo`) so resetting it never touches a real child's progress.
