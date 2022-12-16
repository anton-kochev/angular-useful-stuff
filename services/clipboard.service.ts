import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { equal, or } from '../../common/utils/logical-util';

@Injectable()
export class ClipboardService {
  public read(): Observable<string> {
    return this.tryRead().pipe(switchMap(() => this.readInternal()));
  }

  public write(text: string): Observable<boolean> {
    return this.tryWrite().pipe(switchMap(() => this.writeInternal(text)));
  }

  private readInternal(): Observable<string> {
    return new Observable<string>(observer => {
      navigator.clipboard.readText().then(
        str => (observer.next(str), observer.complete()),
        () => observer.next(),
      );

      return { unsubscribe: (): void => {} };
    });
  }

  private writeInternal(text: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      navigator.clipboard.writeText(text).then(
        () => (observer.next(true), observer.complete()),
        () => observer.next(false),
      );

      return { unsubscribe: (): void => {} };
    });
  }

  private tryAccess(permission: PermissionName): Observable<void> {
    return new Observable<void>(observer => {
      navigator.permissions.query({ name: permission }).then(result => {
        if (or(equal(result.state, 'granted'), equal(result.state, 'prompt'))) {
          observer.next();
          observer.complete();
        } else {
          observer.error();
        }
      });

      return { unsubscribe: (): void => {} };
    });
  }

  private tryRead(): Observable<void> {
    return this.tryAccess('clipboard-read' as PermissionName);
  }

  private tryWrite(): Observable<void> {
    return this.tryAccess('clipboard-write' as PermissionName);
  }
}
