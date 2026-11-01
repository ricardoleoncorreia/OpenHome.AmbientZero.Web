import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBarComponent } from './nav-bar.component';
import { NabVarItem } from './nab-var-item';

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;
  let emittedIndexes: number[];

  const tabs: NabVarItem[] = [
    { id: 0, selectorId: 'general-tab', label: 'General', icon: '@tui.cog', enabled: true },
    { id: 1, selectorId: 'network-tab', label: 'Network', icon: '@tui.router', enabled: true },
    {
      id: 2,
      selectorId: 'users-tab',
      label: 'Users',
      icon: '@tui.user',
      enabled: false,
      hint: 'Coming Soon',
    },
  ];

  const tabElements = () =>
    Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('[role="tab"]'));

  const tabNamed = (name: string) => tabElements().find((tab) => tab.textContent?.trim() === name)!;

  const pressKey = async (tab: HTMLButtonElement, key: string) => {
    tab.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    emittedIndexes = [];
    component.activeItemIndexChange.subscribe((index) => emittedIndexes.push(index));
    fixture.componentRef.setInput('tabs', tabs);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the tabs inside a tablist', () => {
    expect(fixture.nativeElement.querySelector('[role="tablist"]')).not.toBeNull();
    expect(tabElements().map((tab) => tab.textContent?.trim())).toEqual([
      'General',
      'Network',
      'Users',
    ]);
  });

  it('should select the first tab and keep only it in the tab order', () => {
    expect(tabElements().map((tab) => tab.getAttribute('aria-selected'))).toEqual([
      'true',
      'false',
      'false',
    ]);
    expect(tabElements().map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);
  });

  it('should mark disabled tabs as disabled', () => {
    expect(tabNamed('Users').getAttribute('aria-disabled')).toBe('true');
    expect(tabNamed('Network').hasAttribute('aria-disabled')).toBe(false);
  });

  it('should select a tab when it is clicked', async () => {
    tabNamed('Network').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emittedIndexes).toEqual([1]);
    expect(tabNamed('Network').getAttribute('aria-selected')).toBe('true');
  });

  it('should ignore clicks on a disabled tab', async () => {
    tabNamed('Users').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emittedIndexes).toEqual([]);
    expect(tabNamed('General').getAttribute('aria-selected')).toBe('true');
  });

  it.each`
    key             | expectedFocus | expectedEmits
    ${'ArrowRight'} | ${'Network'}  | ${[1]}
    ${'End'}        | ${'Users'}    | ${[]}
    ${'ArrowLeft'}  | ${'Users'}    | ${[]}
  `(
    'should move focus to $expectedFocus when $key is pressed on the first tab',
    async ({ key, expectedFocus, expectedEmits }) => {
      await pressKey(tabNamed('General'), key);

      expect(document.activeElement).toBe(tabNamed(expectedFocus));
      expect(emittedIndexes).toEqual(expectedEmits);
    },
  );

  it('should move focus to the first tab when Home is pressed', async () => {
    await pressKey(tabNamed('Network'), 'Home');

    expect(document.activeElement).toBe(tabNamed('General'));
  });
});
