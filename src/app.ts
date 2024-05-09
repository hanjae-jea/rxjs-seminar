import {
  filter,
  finalize,
  fromEvent,
  skipWhile,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";

const first = document.getElementById("first")!;

const mouseDown$ = fromEvent<MouseEvent>(first, "mousedown");
const mouseMove$ = fromEvent<MouseEvent>(document, "mousemove");
const mouseUp$ = fromEvent<MouseEvent>(document, "mouseup");

const drag$ = mouseDown$.pipe(
  switchMap((start) => {
    const startLeft = start.clientX - first.offsetLeft;
    const startTop = start.clientY - first.offsetTop;
    first.style.opacity = "0.5";

    return mouseMove$.pipe(
      skipWhile((move) => {
        return (
          Math.abs(start.clientX - move.clientX) +
            Math.abs(start.clientY - move.clientY) <
          200
        );
      }),
      tap((move) => {
        if (move.clientY - startTop < 0) {
          throw new Error("top is less than 0");
        }
        first.style.top = `${move.clientY - startTop}px`;
        first.style.left = `${move.clientX - startLeft}px`;
      }),
      takeUntil(mouseUp$.pipe(tap(() => (first.style.opacity = "1"))))
      // finalize(() => {
      //   first.style.opacity = "1";
      // })
    );
  })
);
drag$.subscribe({
  next: (e) => {
    console.log("drag", e);
  },
  error: (err) => {
    console.log(err);
  },
});

// mouseDown$.subscribe((e) => {
//   console.log("mouse down", e);
// });

// mouseMove$.subscribe((e) => {
//   console.log("mouse move", e);
// });

// mouseUp$.subscribe((e) => {
//   console.log("mouse up", e);
// });
