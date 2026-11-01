import {
  Component,
  ElementRef,
  EventEmitter,
  input,
  Output,
  signal,
  viewChildren,
} from '@angular/core';
import { TuiIcon, TuiHintDirective, TuiHint } from '@taiga-ui/core';
import { NabVarItem } from './nab-var-item';

@Component({
  selector: 'app-nav-bar',
  imports: [TuiIcon, TuiHint, TuiHintDirective],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.less',
})
export class NavBarComponent {
  @Output() readonly activeItemIndexChange = new EventEmitter<number>();

  readonly tabs = input.required<NabVarItem[]>();
  protected index = signal(0);
  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  setActive(i: number) {
    if (!this.tabs()[i].enabled) {
      return;
    }

    this.index.set(i);
    this.activeItemIndexChange.emit(i);
  }

  protected onKeydown(event: KeyboardEvent) {
    const buttons = this.tabButtons().map(({ nativeElement }) => nativeElement);
    const current = buttons.indexOf(event.target as HTMLButtonElement);
    const next = this.keyTarget(event.key, current, buttons.length);

    if (current === -1 || next === undefined) {
      return;
    }

    event.preventDefault();
    buttons[next].focus();
    this.setActive(next);
  }

  private keyTarget(key: string, current: number, count: number): number | undefined {
    switch (key) {
      case 'ArrowRight':
        return (current + 1) % count;
      case 'ArrowLeft':
        return (current - 1 + count) % count;
      case 'Home':
        return 0;
      case 'End':
        return count - 1;
      default:
        return undefined;
    }
  }
}
