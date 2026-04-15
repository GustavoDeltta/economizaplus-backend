import { env } from './shared/env';
import { createApp } from './app';

const app = createApp();
const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});