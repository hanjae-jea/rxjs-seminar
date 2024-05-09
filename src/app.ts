import {
  animationFrameScheduler,
  BehaviorSubject,
  distinctUntilChanged,
  finalize,
  fromEvent,
  map,
  observeOn,
  partition,
  share,
  skipWhile,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";

const draggables = document.querySelectorAll<HTMLElement>(".draggable");

draggables.forEach((draggable) => {
  const mouseDown$ = fromEvent<MouseEvent>(draggable, "mousedown");
  const mouseMove$ = fromEvent<MouseEvent>(document, "mousemove").pipe(
    observeOn(animationFrameScheduler)
  );
  const mouseUp$ = fromEvent<MouseEvent>(document, "mouseup");

  const threshold = 30;
  const color$ = new BehaviorSubject<string>("");

  const drag$ = mouseDown$.pipe(
    tap(() => (draggable.style.opacity = "0.5")),
    switchMap((start) => {
      const startX = start.clientX - draggable.offsetLeft;
      const startY = start.clientY - draggable.offsetTop;

      return mouseMove$.pipe(
        map((move) => ({
          left: move.clientX - startX,
          top: move.clientY - startY,
          // 성능을 위해 manhattan distance 사용
          distance:
            Math.abs(move.clientX - start.clientX) +
            Math.abs(move.clientY - start.clientY),
        })),
        skipWhile((pos) => pos.distance < threshold),
        // filter((pos) => pos.distance > threshold),
        distinctUntilChanged((prev, curr) => {
          return prev.left === curr.left && prev.top === curr.top;
        }),
        tap((pos) => {
          console.log("pos", pos);
          draggable.style.transform = `translate(${
            pos.left - start.clientX + startX
          }px, ${pos.top - start.clientY + startY}px)`;

          (pos.left > 100 ? "blue" : "red") !== color$.value &&
            color$.next(pos.left > 100 ? "blue" : "red");
        }),
        takeUntil(
          mouseUp$.pipe(
            tap((move) => {
              draggable.style.cssText = `
                left: ${move.clientX - startX}px;
                top: ${move.clientY - startY}px;
                opacity: 1;
                transform: "";
              `;
            })
          )
        ),
        finalize(() => {
          draggable.style.opacity = "1";
          draggable.style.transform = "";
        })
      );
    }),
    share()
  );

  // color option 1
  color$.subscribe((color) => {
    draggable.style.backgroundColor = color;
  });
  drag$.subscribe();

  // color option2
  // drag$
  //   .pipe(
  //     map((pos) => pos.left > 100),
  //     distinctUntilChanged()
  //   )
  //   .subscribe((over100) => {
  //     draggable.style.backgroundColor = over100 ? "blue" : "red";
  //   });

  // color option 1 : not good way.
  // const [over100$, under100$] = partition(drag$, (pos) => pos.left > 100);

  // over100$.subscribe(() => {
  //   draggable.style.backgroundColor = "blue";
  // });

  // under100$.subscribe(() => {
  //   console.log("under 100");
  //   draggable.style.backgroundColor = "red";
  // });
});
