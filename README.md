# Trazabilidad360 Playwright Automation

A robust test automation framework built with Playwright and TypeScript, implementing the Page Object Model (POM) pattern for scalable and maintainable end-to-end testing of the Trazabilidad360 platform.

## 🚀 Features

- **Page Object Model (POM)** - Clean separation of test logic and page elements
- **TypeScript Support** - Type-safe test development with strict linting
- **Multi-browser Testing** - Support for Chromium, Firefox, and WebKit
- **Database Integration** - Prisma ORM with PostgreSQL for test data management
- **Raw SQL Support** - Execute custom SQL queries alongside ORM operations
- **API Testing** - Comprehensive API testing with REST providers
- **Environment Configuration** - Flexible configuration for different environments
- **Code Quality** - Biome linting and formatting with pre-commit hooks
- **Rich Reporting** - HTML, JSON, and JUnit reports with detailed test results
- **Excel Integration** - Read/write Excel files for data-driven testing
- **CI/CD Ready** - Optimized for continuous integration pipelines

## 📋 Prerequisites

- Node.js (>= 18.0.0)
- npm or yarn
- PostgreSQL database (for test data management)
- Git (for version control and pre-commit hooks)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Trazabilidad360Playwright
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

4. Set up environment variables:
```bash
# Create .env file with your configuration
# See the Environment Variables section below for required variables
```

5. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

6. Set up code quality tools:
```bash
# Install git hooks for code quality
npm run prepare

# Run code formatting and linting
npm run check
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Environment Configuration
NODE_ENV=development
CI=false

# Application URLs
BASE_URL=https://practicetestautomation.com

# Database Configuration
DATABASE_URL='jdbc:postgresql://host:port/database_name'
DB_HOST='your_db_host'
DB_PORT=5444
DB_NAME='your_database_name'
DB_USER='your_username'
DB_PASSWORD='your_password'
DB_SCHEMA='olva'

# Test Data
TEST_USERNAME=student
TEST_PASSWORD=Password123

# Playwright Configuration
STORAGE_STATE_PATH=./auth-state.json
START_LOCAL_SERVER=false

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/test.log

# Screenshots and Videos
SCREENSHOT_MODE=only-on-failure
VIDEO_MODE=retain-on-failure
TRACE_MODE=on-first-retry

# Database Pool Configuration
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000

# Test Environment Specific
ENVIRONMENT=development
TEST_SUITE=smoke

# API Test Environment Specific
API_BASE_URL_OLVAEXRESS_DEV=https://api-dev.olvaexpress.pe
API_BASE_URL_OLVAEXRESS_PROD=https://api.olvaexpress.pe
X_API_KEY=your-api-key
```

## 🏗️ Project Structure

```
Trazabilidad360Playwright/
├── src/
│   ├── apiProviders/               # API client providers
│   │   └── olvaexpress.ts         # OlvaExpress API provider
│   ├── config/
│   │   └── environment.ts         # Environment configuration
│   ├── database/
│   │   ├── connection.ts          # Database connection singleton
│   │   └── testDataHelpers.ts     # Database query helpers
│   ├── pages/
│   │   ├── base/
│   │   │   └── BasePage.ts        # Base page class
│   │   └── LoginPage.ts           # Login page object
│   ├── testData/
│   │   ├── archivosExcel/         # Excel test data files
│   │   └── archivosJson/          # JSON test data files
│   ├── types/
│   │   └── excelInterfaces.ts     # Excel type definitions
│   └── utils/
│       ├── helpers.ts             # Utility functions
│       └── validadores.ts         # Data validators
├── tests/
│   ├── api/
│   │   └── notificacionesWhatsapp/ # WhatsApp notifications tests
│   ├── e2e/
│   │   ├── mobile/                # Mobile end-to-end tests
│   │   └── web/                   # Web end-to-end tests
│   └── setup/
│       ├── global-setup.ts        # Global test setup
│       └── global-teardown.ts     # Global test teardown
├── prisma/
│   └── schema.prisma              # Database schema
├── resultados-exportados/         # Test results exports
├── biome.json                     # Biome linting configuration
├── playwright.config.ts           # Playwright configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json
```

## 🧪 Running Tests

### Run all tests:
```bash
npm test
# or
npx playwright test
```

### Run tests in headed mode:
```bash
npm run test:headed
# or
npx playwright test --headed
```

### Run specific test file:
```bash
npx playwright test tests/api/notificacionesWhatsapp/enviarNotificacion.spec.ts
```

### Run specific test suite:
```bash
# WhatsApp notifications tests
npx playwright test tests/api/notificacionesWhatsapp/

# Web end-to-end tests
npx playwright test tests/e2e/web/

# Mobile end-to-end tests
npx playwright test tests/e2e/mobile/
```

### Run tests with specific browser:
```bash
npx playwright test --project=chromium
```

### Run tests in debug mode:
```bash
npx playwright test --debug
```

### Run tests with custom environment:
```bash
ENVIRONMENT=production npx playwright test
```

## 📊 Reports

After running tests, you can view reports:

### HTML Report:
```bash
npx playwright show-report
```

Reports are generated in:
- `playwright-report/` - HTML report
- `test-results/` - JSON and JUnit reports

## 🔧 Development

### Code Quality and Linting

This project uses Biome for linting and formatting:

```bash
# Check and fix code formatting/linting
npm run check

# Only check without fixing
npm run lint

# Compile TypeScript
npm run tsc

# Generate Prisma client
npm run prisma:generate
```

### Adding New Page Objects

1. Create a new page class extending `BasePage`:

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/BasePage';

export class YourPage extends BasePage {
  private readonly yourElement: Locator;

  constructor(page: Page) {
    super(page);
    this.yourElement = page.locator('#your-element');
  }

  public async yourMethod(): Promise<void> {
    // Implementation
  }
}
```

2. Create corresponding test file in `tests/e2e/web/`

### Database Operations

#### Using Prisma ORM (Recommended):
```typescript
import { prisma } from '../database/connection';

// Query with ORM
const notifications = await prisma.notificaciones.findMany({
  where: {
    fecha_creacion: { gt: new Date('2025-01-01') },
    estado: 'ENVIADO'
  },
  select: {
    id: true,
    telefono: true,
    mensaje: true,
    estado: true
  },
  orderBy: { fecha_creacion: 'desc' },
  take: 10
});
```

#### Using Raw SQL (For complex queries):
```typescript
import { prisma } from '../database/connection';

// Raw SQL query
const results = await prisma.$queryRaw`
  SELECT n.id, n.telefono, n.mensaje, n.estado
  FROM notificaciones n
  WHERE n.fecha_creacion > ${new Date('2025-01-01')}
    AND n.estado = 'ENVIADO'
  ORDER BY n.fecha_creacion DESC
  LIMIT 10
`;
```

### API Testing

#### Creating API Providers:
```typescript
import { request } from '@playwright/test';

export class OlvaExpressApiProvider {
  private baseUrl: any;

  async init() {
    this.baseUrl = await request.newContext({
      baseURL: process.env.API_BASE_URL_OLVAEXPRESS,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_KEY_OLVAEXPRESS}`
      }
    });
    return this;
  }

  async enviarNotificacion(data: any) {
    return await this.baseUrl.post('/notificaciones/whatsapp', { data });
  }
}
```

### Excel Data Testing

```typescript
import { leerDatosDesdeExcel, exportarResultadosGenerico } from '../utils/helpers';

// Read Excel data
const datos = leerDatosDesdeExcel('./path/to/file.xlsx', 'SheetName');

// Export results to Excel
exportarResultadosGenerico({
  data: results,
  nombreBase: 'test_results',
  headers: ['Column1', 'Column2'],
  extraerCampos: [(r) => r.field1, (r) => r.field2]
});
```

## 🚀 CI/CD Integration

The framework is optimized for CI/CD with:
- Parallel test execution
- Retry mechanisms
- Multiple report formats
- Environment-specific configurations

### GitHub Actions Example:

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
```

## 📝 Best Practices

1. **Page Objects**: Keep page objects focused and maintainable
2. **Test Data**: Use external data files for test inputs
3. **Assertions**: Use meaningful assertion messages
4. **Waits**: Prefer explicit waits over implicit ones
5. **Environment**: Use environment-specific configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions and support, please:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

## � Useful Links

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Prisma Documentation](https://www.prisma.io/)
