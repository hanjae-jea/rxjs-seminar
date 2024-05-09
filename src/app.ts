import { interval, tap } from "rxjs";

interval(1000)
  .pipe(
    tap(() => {
      alert("hi");
    })
  )
  .subscribe();
