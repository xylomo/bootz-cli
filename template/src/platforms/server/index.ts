
import { app } from './server';

const isProduction = process.env.NODE_ENV === 'production';

process.on('uncaughtException', (err) => {
  console.error('uncaughtexception', err);
  process.exit(1);
});

if (isProduction) {
  const PORT = parseInt(String(process.env.PORT), 10) || 3000;
  app.listen(PORT, () => {
    console.log('server listening on port', PORT);
  });
}

if (module.hot) {
  app['hot'] = module.hot;
  module.hot.accept();
}

export default app;
