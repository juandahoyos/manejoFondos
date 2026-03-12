import { render } from '@testing-library/angular';
import { App } from './app';
import { provideRouter } from '@angular/router';

describe('App', () => {
  const setupComponent = async () => {
    return await render(App, {
      providers: [provideRouter([])]
    });
  };

  it('debe crear la aplicación', async () => {
    const { fixture } = await setupComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debe contener router-outlet para navegación', async () => {
    const { container } = await setupComponent();
    expect(container.querySelector('router-outlet')).toBeTruthy();
  });
});
