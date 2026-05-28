import prisma from './prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🔄 Очищення бази даних перед заповненням...');

  // Видаляємо дані в правильному порядку, щоб уникнути конфліктів зовнішніх ключів
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.authLog.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Базу даних очищено.');

  console.log('👥 Створення користувачів...');
  const passwordHash = await bcrypt.hash('admin123', 10);

  const usersData = [
    {
      email: 'admin@taskflow.com',
      full_name: 'Андрій Коваль',
      role: 'admin' as const,
      avatar_color: '#4f46e5',
      department: 'Дирекція',
    },
    {
      email: 'm.shevchenko@taskflow.ua',
      full_name: 'Марія Шевченко',
      role: 'manager' as const,
      avatar_color: '#0ea5e9',
      department: 'Управління продуктом',
    },
    {
      email: 'o.bondar@taskflow.ua',
      full_name: 'Олександр Бондар',
      role: 'manager' as const,
      avatar_color: '#10b981',
      department: 'Технічний менеджмент',
    },
    {
      email: 'a.shevchenko@taskflow.ua',
      full_name: 'Артем Шевченко',
      role: 'manager' as const,
      avatar_color: '#3b82f6',
      department: 'Управління продуктом',
    },
    {
      email: 'o.lysenko@taskflow.ua',
      full_name: 'Олена Лисенко',
      role: 'worker' as const,
      avatar_color: '#f59e0b',
      department: 'Frontend розробка',
    },
    {
      email: 'o.moroz@taskflow.ua',
      full_name: 'Ольга Мороз',
      role: 'worker' as const,
      avatar_color: '#8b5cf6',
      department: 'Frontend розробка',
    },
    {
      email: 's.kravchenko@taskflow.ua',
      full_name: 'Сергій Кравченко',
      role: 'worker' as const,
      avatar_color: '#ec4899',
      department: 'Backend розробка',
    },
    {
      email: 'd.kravchenko@taskflow.ua',
      full_name: 'Дмитро Кравченко',
      role: 'worker' as const,
      avatar_color: '#f43f5e',
      department: 'Backend розробка',
    },
    {
      email: 'r.pavlyuk@taskflow.ua',
      full_name: 'Роман Павлюк',
      role: 'worker' as const,
      avatar_color: '#eab308',
      department: 'Backend розробка',
    },
    {
      email: 'i.moroz@taskflow.ua',
      full_name: 'Ірина Мороз',
      role: 'worker' as const,
      avatar_color: '#8b5cf6',
      department: 'Тестування та QA',
    },
    {
      email: 'a.sidorenko@taskflow.ua',
      full_name: 'Анна Сидоренко',
      role: 'worker' as const,
      avatar_color: '#10b981',
      department: 'Тестування та QA',
    },
    {
      email: 'v.petrenko@taskflow.ua',
      full_name: 'Василь Петренко',
      role: 'worker' as const,
      avatar_color: '#f43f5e',
      department: 'UI/UX Дизайн',
    },
    {
      email: 'k.kozak@taskflow.ua',
      full_name: 'Катерина Козак',
      role: 'worker' as const,
      avatar_color: '#ec4899',
      department: 'UI/UX Дизайн',
    },
    {
      email: 't.romanyuk@taskflow.ua',
      full_name: 'Тетяна Романюк',
      role: 'worker' as const,
      avatar_color: '#14b8a6',
      department: 'DevOps & Хмари',
    },
    {
      email: 'm.lysenko@taskflow.ua',
      full_name: 'Михайло Лисенко',
      role: 'worker' as const,
      avatar_color: '#14b8a6',
      department: 'DevOps & Хмари',
    },
  ];

  const users: any[] = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        full_name: u.full_name,
        password: passwordHash,
        role: u.role,
        avatar_color: u.avatar_color,
        department: u.department,
      },
    });
    users.push(user);
    console.log(`👤 Користувач створений: ${user.full_name} (${user.role})`);
  }

  const admin = users.find(u => u.role === 'admin');
  const mgr1 = users.find(u => u.email === 'm.shevchenko@taskflow.ua');
  const mgr2 = users.find(u => u.email === 'o.bondar@taskflow.ua');
  const mgr3 = users.find(u => u.email === 'a.shevchenko@taskflow.ua');
  const workerFE = users.find(u => u.email === 'o.lysenko@taskflow.ua');
  const workerFE2 = users.find(u => u.email === 'o.moroz@taskflow.ua');
  const workerBE = users.find(u => u.email === 's.kravchenko@taskflow.ua');
  const workerBE2 = users.find(u => u.email === 'd.kravchenko@taskflow.ua');
  const workerBE3 = users.find(u => u.email === 'r.pavlyuk@taskflow.ua');
  const workerQA = users.find(u => u.email === 'i.moroz@taskflow.ua');
  const workerQA2 = users.find(u => u.email === 'a.sidorenko@taskflow.ua');
  const workerDesign = users.find(u => u.email === 'v.petrenko@taskflow.ua');
  const workerDesign2 = users.find(u => u.email === 'k.kozak@taskflow.ua');
  const workerDevOps = users.find(u => u.email === 't.romanyuk@taskflow.ua');
  const workerDevOps2 = users.find(u => u.email === 'm.lysenko@taskflow.ua');

  console.log('📁 Створення проектів...');
  const projectsData = [
    {
      title: 'Мобільний банкінг TaskFlow',
      description: 'Розробка нового додатку для мобільного банкінгу з підтримкою переказів, оплати комунальних послуг та кешбеку.',
      status: 'active' as const,
      priority: 'high' as const,
      color: '#4f46e5',
      manager_id: mgr1.id,
      deadline: new Date('2026-09-01'),
    },
    {
      title: 'Інтеграція платіжної системи LiqPay',
      description: 'Підключення платіжного шлюзу LiqPay для автоматичного прийому платежів та виставлення інвойсів.',
      status: 'active' as const,
      priority: 'critical' as const,
      color: '#10b981',
      manager_id: mgr2.id,
      deadline: new Date('2026-06-30'),
    },
    {
      title: 'Ребрендинг корпоративного порталу',
      description: 'Оновлення дизайну, UI/UX та структури внутрішнього порталу компанії відповідно до нового брендбуку.',
      status: 'active' as const,
      priority: 'medium' as const,
      color: '#f59e0b',
      manager_id: mgr1.id,
      deadline: new Date('2026-07-15'),
    },
    {
      title: 'Оптимізація бази даних CRM',
      description: 'Аналіз повільних запитів, налаштування індексів та реплікації для прискорення роботи CRM-системи.',
      status: 'active' as const,
      priority: 'high' as const,
      color: '#ec4899',
      manager_id: mgr2.id,
      deadline: new Date('2026-08-10'),
    },
    {
      title: 'Впровадження AI-асистента підтримки',
      description: 'Дослідження та інтеграція мовної модели для автоматизації відповідей на першу лінію підтримки користувачів.',
      status: 'active' as const,
      priority: 'medium' as const,
      color: '#8b5cf6',
      manager_id: mgr1.id,
      deadline: new Date('2026-10-01'),
    },
    {
      title: 'Дизайн-система TaskFlow UI',
      description: 'Розробка та документування UI-кіта для прискорення розробки нових інтерфейсів компанії.',
      status: 'completed' as const,
      priority: 'high' as const,
      color: '#0ea5e9',
      manager_id: mgr1.id,
      deadline: new Date('2026-04-15'),
    },
    {
      title: 'Міграція інфраструктури на AWS Cloud',
      description: 'Перенесення серверів та сервісів із локальної інфраструктури в хмару AWS, налаштування CI/CD та Docker.',
      status: 'on_hold' as const,
      priority: 'critical' as const,
      color: '#f43f5e',
      manager_id: mgr2.id,
      deadline: new Date('2026-12-31'),
    },
    {
      title: 'Автоматизація тестування (E2E)',
      description: 'Створення фреймворку для автоматичного E2E-тестування веб-додатків за допомогою Playwright.',
      status: 'active' as const,
      priority: 'low' as const,
      color: '#14b8a6',
      manager_id: mgr1.id,
      deadline: new Date('2026-07-30'),
    },
    {
      title: 'Аналітичний модуль TaskFlow BI',
      description: 'Збір та візуалізація бізнес-метрик, побудова інтерактивних дашбордів для керівництва.',
      status: 'active' as const,
      priority: 'medium' as const,
      color: '#06b6d4',
      manager_id: mgr2.id,
      deadline: new Date('2026-08-31'),
    },
    {
      title: 'Аудит кібербезпеки порталу',
      description: 'Пошук вразливостей (SQL-ін\'єкції, XSS, CSRF), перевірка шифрування даних та налаштування політики доступу.',
      status: 'active' as const,
      priority: 'critical' as const,
      color: '#ef4444',
      manager_id: mgr2.id,
      deadline: new Date('2026-06-25'),
    },
    {
      title: 'Локалізація та вихід на ринок ЄС',
      description: 'Переклад інтерфейсів англійською, польською та німецькою мовами, адаптація під вимоги GDPR.',
      status: 'active' as const,
      priority: 'medium' as const,
      color: '#a855f7',
      manager_id: mgr1.id,
      deadline: new Date('2026-09-30'),
    },
    {
      title: 'Система лояльності та бонусів',
      description: 'Розробка накопичувальної системи балів, промокодів та персональних знижок для клієнтів.',
      status: 'completed' as const,
      priority: 'low' as const,
      color: '#84cc16',
      manager_id: mgr2.id,
      deadline: new Date('2026-05-01'),
    },
  ];

  const projects: any[] = [];
  for (const p of projectsData) {
    const project = await prisma.project.create({
      data: p,
    });
    projects.push(project);
    console.log(`📁 Проект створено: "${project.title}"`);
  }

  const prjMobile = projects.find(p => p.title.includes('Мобільний банкінг'));
  const prjLiqPay = projects.find(p => p.title.includes('LiqPay'));
  const prjPortal = projects.find(p => p.title.includes('Ребрендинг'));
  const prjCRM = projects.find(p => p.title.includes('CRM'));
  const prjAI = projects.find(p => p.title.includes('AI-асистента'));
  const prjUI = projects.find(p => p.title.includes('Дизайн-система'));
  const prjAWS = projects.find(p => p.title.includes('AWS Cloud'));
  const prjQA = projects.find(p => p.title.includes('Автоматизація тестування'));
  const prjBI = projects.find(p => p.title.includes('BI'));
  const prjSec = projects.find(p => p.title.includes('кібербезпеки'));

  console.log('📋 Створення задач та підзадач...');

  // 1. Проект Мобільний банкінг
  const task1 = await prisma.task.create({
    data: {
      title: 'Дослідження інтеграції Apple Pay & Google Pay API',
      description: 'Дослідити вимоги та безпекові протоколи для підключення безконтактних платежів у мобільному додатку.',
      type: 'research',
      status: 'research',
      priority: 'high',
      deadline: new Date('2026-06-15'),
      estimated_hours: 16,
      project_id: prjMobile.id,
      assignee_id: workerFE.id,
      reporter_id: mgr1.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Розробка екрану авторизації за біометрією (FaceID)',
      description: 'Створити UI-інтерфейс та підключити бібліотеки розпізнавання обличчя та відбитка пальця.',
      type: 'standard',
      status: 'in_progress',
      priority: 'high',
      deadline: new Date('2026-06-20'),
      estimated_hours: 12,
      project_id: prjMobile.id,
      assignee_id: workerFE.id,
      reporter_id: mgr1.id,
    },
  });

  // Підзадачі для FaceID
  await prisma.task.create({
    data: {
      title: 'Розробка дизайну екрану FaceID у Figma',
      description: 'Підготувати макети екрану підтвердження біометрії для iOS та Android.',
      type: 'standard',
      status: 'done',
      priority: 'medium',
      deadline: new Date('2026-06-05'),
      estimated_hours: 4,
      project_id: prjMobile.id,
      assignee_id: workerDesign.id,
      reporter_id: mgr1.id,
      parent_id: task2.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Інтеграція FaceID API на iOS (Swift)',
      description: 'Використати LocalAuthentication фреймворк для виклику системного вікна біометрії.',
      type: 'standard',
      status: 'in_progress',
      priority: 'high',
      deadline: new Date('2026-06-18'),
      estimated_hours: 5,
      project_id: prjMobile.id,
      assignee_id: workerFE.id,
      reporter_id: mgr1.id,
      parent_id: task2.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Інтеграція BiometricPrompt API на Android',
      description: 'Забезпечити сумісність із різними версіями Android за допомогою бібліотеки androidx.biometric.',
      type: 'standard',
      status: 'todo',
      priority: 'high',
      deadline: new Date('2026-06-20'),
      estimated_hours: 6,
      project_id: prjMobile.id,
      assignee_id: workerBE.id, // backend dev helping on mobile
      reporter_id: mgr1.id,
      parent_id: task2.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Тестування безпеки транзакцій та переказів',
      description: 'Написати юніт-тести та провести мануальний аудит безпеки переказу коштів між картками.',
      type: 'standard',
      status: 'review',
      priority: 'critical',
      deadline: new Date('2026-06-25'),
      estimated_hours: 20,
      project_id: prjMobile.id,
      assignee_id: workerQA.id,
      reporter_id: mgr1.id,
    },
  });

  // 2. Проект LiqPay
  const task4 = await prisma.task.create({
    data: {
      title: 'Дослідження API LiqPay для регулярних платежів (підписок)',
      description: 'Аналіз документації LiqPay щодо автоматичного списання коштів раз на місяць (рекурентні платежі).',
      type: 'research',
      status: 'research',
      priority: 'critical',
      deadline: new Date('2026-06-10'),
      estimated_hours: 8,
      project_id: prjLiqPay.id,
      assignee_id: workerBE.id,
      reporter_id: mgr2.id,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      title: 'Створення webhook-обробника для успішних оплат',
      description: 'Реалізація endpoint-а для отримання статусів оплат від LiqPay та оновлення статусу замовлення в БД.',
      type: 'standard',
      status: 'in_progress',
      priority: 'high',
      deadline: new Date('2026-06-15'),
      estimated_hours: 10,
      project_id: prjLiqPay.id,
      assignee_id: workerBE.id,
      reporter_id: mgr2.id,
    },
  });

  const task6 = await prisma.task.create({
    data: {
      title: 'Верстка форми введення карткових реквізитів',
      description: 'Створити адаптивну форму з валідацією номера картки, терміну дії та CVV-коду.',
      type: 'standard',
      status: 'done',
      priority: 'medium',
      deadline: new Date('2026-06-01'),
      estimated_hours: 6,
      project_id: prjLiqPay.id,
      assignee_id: workerDesign.id,
      reporter_id: mgr2.id,
    },
  });

  // 3. Проект Ребрендинг порталу
  const taskPortalDesign = await prisma.task.create({
    data: {
      title: 'Розробка дизайну головної сторінки в Figma (Dark/Light)',
      description: 'Створення темного та світлого варіантів дизайну згідно з новими кольорами компанії.',
      type: 'standard',
      status: 'done',
      priority: 'medium',
      deadline: new Date('2026-06-12'),
      estimated_hours: 24,
      project_id: prjPortal.id,
      assignee_id: workerDesign.id,
      reporter_id: mgr1.id,
    },
  });

  const taskPortalNav = await prisma.task.create({
    data: {
      title: 'Верстка адаптивного меню навігації (Header/Footer)',
      description: 'Реалізувати Header з висувним меню для мобільних пристроїв та Footer зі швидкими посиланнями.',
      type: 'standard',
      status: 'todo',
      priority: 'low',
      deadline: new Date('2026-07-01'),
      estimated_hours: 8,
      project_id: prjPortal.id,
      assignee_id: workerFE.id,
      reporter_id: mgr1.id,
    },
  });

  // 4. Проект Оптимізація БД CRM
  const task7 = await prisma.task.create({
    data: {
      title: 'Аналіз повільних SQL-запитів через EXPLAIN',
      description: 'Визначити запити, які виконуються довше 500мс, та проаналізувати плани їх виконання.',
      type: 'research',
      status: 'in_progress', // Research task that has moved to in_progress
      priority: 'high',
      deadline: new Date('2026-06-25'),
      estimated_hours: 14,
      project_id: prjCRM.id,
      assignee_id: workerBE.id,
      reporter_id: mgr2.id,
    },
  });

  const taskCRMIndex = await prisma.task.create({
    data: {
      title: 'Додавання композитних індексів у таблиці замовлень',
      description: 'Створити індекси на поля user_id, created_at та status для прискорення фільтрації.',
      type: 'standard',
      status: 'todo',
      priority: 'high',
      deadline: new Date('2026-07-05'),
      estimated_hours: 4,
      project_id: prjCRM.id,
      assignee_id: workerBE.id,
      reporter_id: mgr2.id,
    },
  });

  // 5. AI Асистент
  const taskAIOpenAI = await prisma.task.create({
    data: {
      title: 'Дослідження OpenAI API та порівняння з Claude API',
      description: 'Оцінити точність відповідей, швидкість та вартість токенів для GPT-4o та Claude 3.5 Sonnet на питаннях підтримки.',
      type: 'research',
      status: 'research',
      priority: 'medium',
      deadline: new Date('2026-07-20'),
      estimated_hours: 24,
      project_id: prjAI.id,
      assignee_id: workerFE.id,
      reporter_id: mgr1.id,
    },
  });

  const taskAIPrompt = await prisma.task.create({
    data: {
      title: 'Створення промпту для класифікації запитів користувачів',
      description: 'Написати системний промпт, який дозволить AI точно визначати категорію проблеми (технічна, фінансова, загальна).',
      type: 'standard',
      status: 'todo',
      priority: 'medium',
      deadline: new Date('2026-08-01'),
      estimated_hours: 6,
      project_id: prjAI.id,
      assignee_id: workerFE.id,
      reporter_id: mgr1.id,
    },
  });

  // 6. Дизайн-система
  const taskUIButtons = await prisma.task.create({
    data: {
      title: 'Створення компонентів кнопок та інпутів',
      description: 'Реалізація гнучких та доступних компонентів Button та Input з різними станами (hover, active, disabled, focus).',
      type: 'standard',
      status: 'done',
      priority: 'high',
      deadline: new Date('2026-04-10'),
      estimated_hours: 16,
      project_id: prjUI.id,
      assignee_id: workerDesign.id,
      reporter_id: mgr1.id,
    },
  });

  const taskUIStorybook = await prisma.task.create({
    data: {
      title: 'Документація колірної палітри та шрифтів у Storybook',
      description: 'Створити сторінку в Storybook, де описані всі CSS-змінні для кольорів та правила використання типографіки.',
      type: 'standard',
      status: 'done',
      priority: 'medium',
      deadline: new Date('2026-04-14'),
      estimated_hours: 8,
      project_id: prjUI.id,
      assignee_id: workerDesign.id,
      reporter_id: mgr1.id,
    },
  });

  // 7. AWS Cloud
  const taskAWSECS = await prisma.task.create({
    data: {
      title: 'Порівняння AWS ECS (Fargate) та Kubernetes (EKS)',
      description: 'Вивчити складність налаштування, ціну та підтримку автоскейлінгу для обох рішень.',
      type: 'research',
      status: 'todo',
      priority: 'critical',
      deadline: new Date('2026-08-15'),
      estimated_hours: 18,
      project_id: prjAWS.id,
      assignee_id: workerDevOps.id,
      reporter_id: mgr2.id,
    },
  });

  const taskAWSDocker = await prisma.task.create({
    data: {
      title: 'Написання Dockerfile для Node.js бекенду',
      description: 'Створити оновлений multi-stage Dockerfile для зменшення розміру підсумкового образу.',
      type: 'standard',
      status: 'todo',
      priority: 'high',
      deadline: new Date('2026-08-01'),
      estimated_hours: 5,
      project_id: prjAWS.id,
      assignee_id: workerDevOps.id,
      reporter_id: mgr2.id,
    },
  });

  // 8. Автоматизація QA
  const taskQAPlaywright = await prisma.task.create({
    data: {
      title: 'Дослідження інтеграції Playwright у CI/CD GitLab',
      description: 'Аналіз вимог до Docker-контейнерів для запуску браузерів у headless-режимі в CI/CD.',
      type: 'research',
      status: 'research',
      priority: 'low',
      deadline: new Date('2026-07-15'),
      estimated_hours: 12,
      project_id: prjQA.id,
      assignee_id: workerQA.id,
      reporter_id: mgr1.id,
    },
  });

  const taskQAAuthTest = await prisma.task.create({
    data: {
      title: 'Написання E2E тесту для процесу авторизації',
      description: 'Створити автотест, який перевіряє успішний вхід, помилку при невірному паролі та відновлення доступу.',
      type: 'standard',
      status: 'todo',
      priority: 'medium',
      deadline: new Date('2026-07-25'),
      estimated_hours: 8,
      project_id: prjQA.id,
      assignee_id: workerQA.id,
      reporter_id: mgr1.id,
    },
  });

  // 9. BI модуль
  const taskBIDAUMAU = await prisma.task.create({
    data: {
      title: 'Побудова дашборду активності користувачів (DAU/MAU)',
      description: 'Створити інтерактивні графіки (лінійний графік DAU/MAU, кругова діаграма за пристроями).',
      type: 'standard',
      status: 'in_progress',
      priority: 'medium',
      deadline: new Date('2026-07-20'),
      estimated_hours: 16,
      project_id: prjBI.id,
      assignee_id: workerFE.id,
      reporter_id: mgr2.id,
    },
  });

  // 10. Кібербезпека
  const taskSecSecrets = await prisma.task.create({
    data: {
      title: 'Сканування коду на наявність hardcoded секретів та токенів',
      description: 'Запуск автоматичного інструменту (TruffleHog або GitGuardian) та аналіз виявлених підозрілих рядків.',
      type: 'research',
      status: 'research',
      priority: 'critical',
      deadline: new Date('2026-06-15'),
      estimated_hours: 10,
      project_id: prjSec.id,
      assignee_id: workerDevOps.id,
      reporter_id: mgr2.id,
    },
  });

  const taskSecHTTPS = await prisma.task.create({
    data: {
      title: 'Налаштування HTTPS та SSL-сертифікатів',
      description: 'Встановити SSL-сертифікати Let\'s Encrypt та налаштувати автоматичне перенаправлення з HTTP на HTTPS.',
      type: 'standard',
      status: 'done',
      priority: 'critical',
      deadline: new Date('2026-05-15'),
      estimated_hours: 4,
      actual_hours: 4,
      project_id: prjSec.id,
      assignee_id: workerDevOps.id,
      reporter_id: mgr2.id,
    },
  });

  // --- NEW CUSTOM SEED TASKS FOR COURSEWORK IMPROVEMENTS ---
  console.log('📋 Створення великої кількості нових кастомних задач для демонстрації покращень...');

  // == 1. РОЗРОБНИЦЬКІ (STANDARD) ЗАДАЧІ ==
  const taskLiqPayAuditFix = await prisma.task.create({
    data: {
      title: 'Виправлення зауважень аудиту безпеки платіжного шлюзу (Протерміновано & Перевищено ліміт часу)',
      description: 'Терміново виправити вразливості у процесі перевірки підписів транзакцій, виявлені під час внутрішнього аудиту.',
      type: 'standard',
      status: 'in_progress',
      priority: 'critical',
      deadline: new Date('2026-05-20'), // Overdue
      estimated_hours: 8,
      actual_hours: 12, // Exceeds
      project_id: prjLiqPay.id,
      assignee_id: workerBE.id,
      reviewer_id: workerFE.id,
      tester_id: workerQA.id,
      reporter_id: mgr2.id,
    },
  });

  const taskZodSchemas = await prisma.task.create({
    data: {
      title: 'Створення та валідація схем вхідних даних для коментарів через Zod (Code Review)',
      description: 'Розробити схеми валідації Zod для API коментарів та підключити їх як Express middleware для перевірки тіла запитів.',
      type: 'standard',
      status: 'code_review',
      priority: 'high',
      deadline: new Date('2026-06-10'),
      estimated_hours: 6,
      actual_hours: 5,
      project_id: prjMobile.id,
      assignee_id: workerBE.id,
      reviewer_id: workerFE.id,
      tester_id: workerQA.id,
      reporter_id: mgr1.id,
    },
  });

  const taskRedisProjects = await prisma.task.create({
    data: {
      title: 'Реалізація Redis-кешу для списку проектів на бекенді (Code Review & Перевищено час)',
      description: 'Налаштувати Redis кешування для прискорення завантаження списку проектів у кабінетах менеджерів.',
      type: 'standard',
      status: 'code_review',
      priority: 'medium',
      deadline: new Date('2026-06-02'),
      estimated_hours: 6,
      actual_hours: 9, // Exceeds
      project_id: prjMobile.id,
      assignee_id: workerBE2.id,
      reviewer_id: workerBE.id,
      tester_id: workerQA2.id,
      reporter_id: mgr2.id,
    },
  });

  const taskPortalUploadDesign = await prisma.task.create({
    data: {
      title: 'Розробка дизайну сторінки завантаження файлів (Виконано)',
      description: 'Розробити інтерфейс перетягування файлів (Drag and Drop) для прикріплення документів до проектів.',
      type: 'standard',
      status: 'done',
      priority: 'low',
      deadline: new Date('2026-05-10'),
      estimated_hours: 8,
      actual_hours: 8,
      project_id: prjPortal.id,
      assignee_id: workerDesign2.id,
      reporter_id: mgr1.id,
    },
  });

  const taskPortalProfileFE = await prisma.task.create({
    data: {
      title: 'Створення адаптивної верстки профілю користувача (В роботі)',
      description: 'Верстка нової сторінки кабінету користувача з можливістю зміни пароля та оновлення аватара.',
      type: 'standard',
      status: 'in_progress',
      priority: 'medium',
      deadline: new Date('2026-06-15'),
      estimated_hours: 16,
      actual_hours: 8,
      project_id: prjPortal.id,
      assignee_id: workerFE2.id,
      reporter_id: mgr1.id,
    },
  });

  const taskAWSDockerCompose = await prisma.task.create({
    data: {
      title: 'Налаштування Docker-compose для локального оточення (Виконано)',
      description: 'Створення конфігураційних файлів docker-compose для швидкого запуску MySQL, Redis та Node сервера розробниками.',
      type: 'standard',
      status: 'done',
      priority: 'high',
      deadline: new Date('2026-05-14'),
      estimated_hours: 6,
      actual_hours: 5,
      project_id: prjAWS.id,
      assignee_id: workerDevOps2.id,
      reporter_id: mgr2.id,
    },
  });

  const taskSecRateLimiting = await prisma.task.create({
    data: {
      title: 'Реалізація rate limiting для API авторизації (Code Review & Протерміновано)',
      description: 'Додати лімітування запитів через express-rate-limit для запобігання brute-force атак на форму входу.',
      type: 'standard',
      status: 'code_review',
      priority: 'critical',
      deadline: new Date('2026-05-22'), // Overdue
      estimated_hours: 8,
      actual_hours: 11, // Exceeds
      project_id: prjSec.id,
      assignee_id: workerBE3.id,
      reviewer_id: workerBE.id,
      tester_id: workerQA.id,
      reporter_id: mgr2.id,
    },
  });

  const taskMobileSubtaskTree = await prisma.task.create({
    data: {
      title: 'Створення компонента дерева підзадач на React (Виконано)',
      description: 'Розробити рекурсивний React компонент для відображення необмеженого дерева підзадач з інтерактивними статусами.',
      type: 'standard',
      status: 'done',
      priority: 'high',
      deadline: new Date('2026-05-24'),
      estimated_hours: 14,
      actual_hours: 14,
      project_id: prjMobile.id,
      assignee_id: workerFE.id,
      reporter_id: mgr1.id,
    },
  });

  // == 2. ДОСЛІДНИЦЬКІ (RESEARCH) ЗАДАЧІ ==
  const taskCRMCaching = await prisma.task.create({
    data: {
      title: 'Дослідження алгоритмів кешування Redis для сесій (Дослідження)',
      description: 'Проаналізувати переваги зберігання refresh-токенів у швидкій пам\'яті Redis порівняно з MySQL базою.',
      type: 'research',
      status: 'research',
      priority: 'medium',
      deadline: new Date('2026-06-20'),
      estimated_hours: 12,
      project_id: prjCRM.id,
      assignee_id: workerBE2.id,
      reporter_id: mgr2.id,
    },
  });

  const taskPortalGDPR = await prisma.task.create({
    data: {
      title: 'Аналіз вимог GDPR для виходу на ринок Європейського Союзу (Дослідження)',
      description: 'Скласти список необхідних змін у структурі зберігання персональних даних користувачів для відповідності GDPR.',
      type: 'research',
      status: 'research',
      priority: 'high',
      deadline: new Date('2026-07-01'),
      estimated_hours: 24,
      project_id: prjPortal.id,
      assignee_id: mgr1.id,
      reporter_id: admin.id,
    },
  });

  const taskAILlama3 = await prisma.task.create({
    data: {
      title: 'Вивчення моделей Llama-3 для роботи асистента в офлайн режимі (В роботі)',
      description: 'Порівняти точність та швидкість генерації відповідей локальних моделей Llama-3-8B на локальних відеокартах.',
      type: 'research',
      status: 'in_progress',
      priority: 'medium',
      deadline: new Date('2026-06-25'),
      estimated_hours: 20,
      project_id: prjAI.id,
      assignee_id: workerBE3.id,
      reporter_id: mgr1.id,
    },
  });

  const taskSecWAF = await prisma.task.create({
    data: {
      title: 'Аналіз інструментів моніторингу безпеки (WAF) для сайту (Дослідження)',
      description: 'Дослідити Cloudflare WAF та AWS WAF, підготувати звіт про можливості блокування OWASP Top 10 загроз.',
      type: 'research',
      status: 'research',
      priority: 'high',
      deadline: new Date('2026-07-05'),
      estimated_hours: 16,
      project_id: prjSec.id,
      assignee_id: workerDevOps2.id,
      reporter_id: mgr2.id,
    },
  });

  // == 3. ТЕСТУВАЛЬНІ (TESTING) ЗАДАЧІ ==
  const taskSecJWTRotation = await prisma.task.create({
    data: {
      title: 'Написання тест-кейсів для перевірки ротації JWT-токенів у HttpOnly Cookies (В роботі & Перевищено час)',
      description: 'Покрити автоматизованими інтеграційними тестами Jest сценарії оновлення сесій та ротації refresh-токенів.',
      type: 'testing',
      status: 'in_progress',
      priority: 'high',
      deadline: new Date('2026-06-05'),
      estimated_hours: 10,
      actual_hours: 14, // Exceeds
      project_id: prjSec.id,
      assignee_id: workerQA.id,
      reviewer_id: workerBE.id,
      reporter_id: mgr2.id,
    },
  });

  const taskMobileRegression = await prisma.task.create({
    data: {
      title: 'Регресійне тестування мобільного банку перед релізом v1.2 (До виконання)',
      description: 'Провести повне мануальне тестування всіх критичних сценаріїв оплати та переказів перед оновленням у AppStore.',
      type: 'testing',
      status: 'todo',
      priority: 'critical',
      deadline: new Date('2026-06-01'),
      estimated_hours: 12,
      project_id: prjMobile.id,
      assignee_id: workerQA2.id,
      reviewer_id: workerQA.id,
      reporter_id: mgr1.id,
    },
  });

  const taskLiqPayPlaywright = await prisma.task.create({
    data: {
      title: 'Написання E2E автотестів для форми оплати LiqPay (В роботі)',
      description: 'Створення автоматичних тестів Playwright для перевірки коректності обробки успішних та помилкових платежів.',
      type: 'testing',
      status: 'in_progress',
      priority: 'high',
      deadline: new Date('2026-06-12'),
      estimated_hours: 16,
      actual_hours: 6,
      project_id: prjLiqPay.id,
      assignee_id: workerQA.id,
      reviewer_id: workerBE2.id,
      reporter_id: mgr2.id,
    },
  });

  const taskCRMLoad = await prisma.task.create({
    data: {
      title: 'Проведення навантажувального тестування (Load Testing) CRM системи (Виконано)',
      description: 'Використати k6 для симуляції 5000 одночасних користувачів та перевірити час відповіді бази даних.',
      type: 'testing',
      status: 'done',
      priority: 'high',
      deadline: new Date('2026-05-24'),
      estimated_hours: 20,
      actual_hours: 20,
      project_id: prjCRM.id,
      assignee_id: workerQA2.id,
      reporter_id: mgr2.id,
    },
  });

  const taskAWSMigrationQA = await prisma.task.create({
    data: {
      title: 'Інтеграційне тестування міграції бази даних у хмару AWS (Беклог)',
      description: 'Скласти план перевірки цілісності та консистентності даних при міграції MySQL бази даних з локального сервера на RDS.',
      type: 'testing',
      status: 'backlog',
      priority: 'medium',
      deadline: new Date('2026-08-01'),
      estimated_hours: 8,
      project_id: prjAWS.id,
      assignee_id: workerQA2.id,
      reporter_id: mgr2.id,
    },
  });

  const taskSecAuthPenTest = await prisma.task.create({
    data: {
      title: 'Тестування безпеки REST API авторизації (До виконання)',
      description: 'Провести тестування на проникнення (Penetration Test) для виявлення вразливостей обходу авторизації.',
      type: 'testing',
      status: 'todo',
      priority: 'critical',
      deadline: new Date('2026-06-18'),
      estimated_hours: 14,
      project_id: prjSec.id,
      assignee_id: workerQA.id,
      reviewer_id: admin.id,
      reporter_id: mgr2.id,
    },
  });

  // == 4. ПЛАНУВАЛЬНІ (PLANNING) ЗАДАЧІ ==
  const taskMobilePlanning = await prisma.task.create({
    data: {
      title: 'Планування спринту та архітектурного дизайну модулів авторизації (Виконано)',
      description: 'Провести мітинг планування та затвердити реляційні зв\'язки для таблиць авторизації.',
      type: 'planning',
      status: 'done',
      priority: 'medium',
      deadline: new Date('2026-05-18'),
      estimated_hours: 4,
      actual_hours: 4,
      project_id: prjMobile.id,
      assignee_id: mgr1.id,
      reporter_id: admin.id,
    },
  });

  const taskPortalRoadmap = await prisma.task.create({
    data: {
      title: 'Розробка дорожньої карти (Roadmap) проекту редизайну порталу (В роботі)',
      description: 'Узгодити етапи розробки, черговість сторінок та призначити відповідальних дизайнерів та розробників.',
      type: 'planning',
      status: 'in_progress',
      priority: 'high',
      deadline: new Date('2026-06-08'),
      estimated_hours: 10,
      actual_hours: 4,
      project_id: prjPortal.id,
      assignee_id: mgr1.id,
      reporter_id: admin.id,
    },
  });

  const taskLiqPayPlan = await prisma.task.create({
    data: {
      title: 'Складання плану інтеграції API LiqPay (Виконано & Економія часу)',
      description: 'Детальний опис кроків розробки: від отримання ключів до підключення бойового середовища.',
      type: 'planning',
      status: 'done',
      priority: 'high',
      deadline: new Date('2026-05-22'),
      estimated_hours: 6,
      actual_hours: 4,
      project_id: prjLiqPay.id,
      assignee_id: mgr2.id,
      reporter_id: admin.id,
    },
  });

  const taskCRMPlanning = await prisma.task.create({
    data: {
      title: 'Планування ресурсів для оптимізації бази даних CRM (До виконання)',
      description: 'Оцінити необхідний час розробників, обсяги тестових баз даних та узгодити час проведення технічних робіт.',
      type: 'planning',
      status: 'todo',
      priority: 'medium',
      deadline: new Date('2026-06-30'),
      estimated_hours: 4,
      project_id: prjCRM.id,
      assignee_id: mgr2.id,
      reporter_id: admin.id,
    },
  });

  const taskAIPlanning = await prisma.task.create({
    data: {
      title: 'Розробка плану впровадження AI-асистента (До виконання)',
      description: 'Скласти детальний план розробки та інтеграції AI-асистента в систему підтримки користувачів.',
      type: 'planning',
      status: 'todo',
      priority: 'medium',
      deadline: new Date('2026-07-10'),
      estimated_hours: 8,
      project_id: prjAI.id,
      assignee_id: workerFE.id,
      reporter_id: admin.id,
    },
  });

  const taskAWSPlanning = await prisma.task.create({
    data: {
      title: 'Планування бюджету та етапів міграції в AWS (Виконано)',
      description: 'Розрахувати очікуваний бюджет на хмару AWS та скласти план етапів міграції інфраструктури.',
      type: 'planning',
      status: 'done',
      priority: 'high',
      deadline: new Date('2026-06-15'),
      estimated_hours: 6,
      actual_hours: 6,
      project_id: prjAWS.id,
      assignee_id: workerDevOps.id,
      reporter_id: admin.id,
    },
  });

  console.log('👑 Створення завдань Адміністратора (adminTask1 - adminTask12)...');

  const adminTask1 = await prisma.task.create({
    data: {
      title: 'Аналітичний звіт та аудит фінансів ІТ (В роботі)',
      description: 'Проведення повного фінансового аудиту ІТ-департаменту за останній рік та планування бюджету.',
      type: 'planning',
      status: 'in_progress',
      priority: 'high',
      deadline: new Date('2026-06-10'),
      estimated_hours: 12,
      project_id: prjBI.id,
      assignee_id: mgr1.id,
      reporter_id: admin.id,
    },
  });

  const adminTask2 = await prisma.task.create({
    data: {
      title: 'Планування та аналіз міграції інфраструктури в AWS (В роботі)',
      description: 'Розрахунок вартості сервісів AWS, аналіз ризиків та підготовка інфраструктури сховища.',
      type: 'planning',
      status: 'in_progress',
      priority: 'critical',
      deadline: new Date('2026-06-15'),
      estimated_hours: 10,
      project_id: prjAWS.id,
      assignee_id: workerDevOps.id,
      reporter_id: admin.id,
    },
  });

  const adminTask3 = await prisma.task.create({
    data: {
      title: 'Створення плану навчання співробітників (Виконано)',
      description: 'Підготувати навчальні матеріали для переходу команди на нову дизайн-систему.',
      type: 'planning',
      status: 'done',
      priority: 'medium',
      deadline: new Date('2026-05-10'),
      estimated_hours: 4,
      actual_hours: 4,
      project_id: prjUI.id,
      assignee_id: workerDesign.id,
      reporter_id: admin.id,
    },
  });

  const adminTask4 = await prisma.task.create({
    data: {
      title: 'Планування релізу мобільного банкінгу v1.2 (До виконання)',
      description: 'Узгодження дати релізу, підготовка реліз-нотаток та проходження рев\'ю в AppStore.',
      type: 'planning',
      status: 'todo',
      priority: 'high',
      deadline: new Date('2026-06-05'),
      estimated_hours: 6,
      project_id: prjMobile.id,
      assignee_id: mgr1.id,
      reporter_id: admin.id,
    },
  });

  const adminTask5 = await prisma.task.create({
    data: {
      title: 'Аудит безпеки авторизації та сесій (В роботі)',
      description: 'Аналіз ризиків зберігання токенів, ротація JWT-токенів та тестування на проникнення.',
      type: 'testing',
      status: 'in_progress',
      priority: 'critical',
      deadline: new Date('2026-06-10'),
      estimated_hours: 14,
      project_id: prjSec.id,
      assignee_id: workerBE.id,
      reporter_id: admin.id,
    },
  });

  const adminTask6 = await prisma.task.create({
    data: {
      title: 'Оптимізація бази даних та реплікація CRM (В роботі)',
      description: 'Налаштування Read Replica для CRM системи для зниження навантаження на мастер-БД.',
      type: 'standard',
      status: 'in_progress',
      priority: 'high',
      deadline: new Date('2026-06-25'),
      estimated_hours: 16,
      project_id: prjCRM.id,
      assignee_id: workerBE2.id,
      reporter_id: admin.id,
    },
  });

  const adminTask7 = await prisma.task.create({
    data: {
      title: 'Розробка кабінету користувача та профілю (В роботі)',
      description: 'Реалізація зміни теми (Dark/Light), оновлення аватара та безпечної зміни пароля.',
      type: 'standard',
      status: 'in_progress',
      priority: 'medium',
      deadline: new Date('2026-06-15'),
      estimated_hours: 12,
      project_id: prjPortal.id,
      assignee_id: workerFE.id,
      reporter_id: admin.id,
    },
  });

  const adminTask8 = await prisma.task.create({
    data: {
      title: 'Інтеграція системи лояльності (Виконано)',
      description: 'Розробка та підключення модуля нарахування балів за активні транзакції.',
      type: 'standard',
      status: 'done',
      priority: 'low',
      deadline: new Date('2026-04-30'),
      estimated_hours: 8,
      actual_hours: 8,
      project_id: prjMobile.id,
      assignee_id: workerFE2.id,
      reporter_id: admin.id,
    },
  });

  const adminTask9 = await prisma.task.create({
    data: {
      title: 'Налаштування моніторингу помилок Sentry (До виконання)',
      description: 'Інтеграція Sentry SDK для фронтенду та бекенду для реалтайм відстеження збоїв.',
      type: 'standard',
      status: 'todo',
      priority: 'high',
      deadline: new Date('2026-06-20'),
      estimated_hours: 6,
      project_id: prjPortal.id,
      assignee_id: workerDevOps2.id,
      reporter_id: admin.id,
    },
  });

  const adminTask10 = await prisma.task.create({
    data: {
      title: 'Створення резервних копій бази даних (Виконано)',
      description: 'Налаштування щоденного бекапу бази даних MySQL у захищене сховище AWS S3.',
      type: 'standard',
      status: 'done',
      priority: 'critical',
      deadline: new Date('2026-05-12'),
      estimated_hours: 4,
      actual_hours: 4,
      project_id: prjAWS.id,
      assignee_id: workerDevOps.id,
      reporter_id: admin.id,
    },
  });

  const adminTask11 = await prisma.task.create({
    data: {
      title: 'Підготовка звіту про покриття коду тестами (Виконано)',
      description: 'Аналіз покриття коду тестами (Jest, Vitest) та написання додаткових юніт-тестів.',
      type: 'testing',
      status: 'done',
      priority: 'medium',
      deadline: new Date('2026-05-10'),
      estimated_hours: 4,
      actual_hours: 4,
      project_id: prjPortal.id,
      assignee_id: admin.id,
      reporter_id: mgr1.id,
    },
  });

  const adminTask12 = await prisma.task.create({
    data: {
      title: 'Аналіз фреймворків для мобільної розробки (Виконано)',
      description: 'Порівняльний аналіз React Native та Flutter для розробки нового банкінг додатку.',
      type: 'research',
      status: 'done',
      priority: 'medium',
      deadline: new Date('2026-05-15'),
      estimated_hours: 8,
      actual_hours: 6,
      project_id: prjMobile.id,
      assignee_id: admin.id,
      reporter_id: mgr1.id,
    },
  });

  console.log('🌱 Створення підзадач для задач Адміністратора...');

  // 1. Subtasks for adminTask1
  await prisma.task.create({
    data: {
      title: 'Аудит витрат ІТ-департаменту',
      description: 'Детальний аналіз витрат на сервери, ПЗ та ліцензії розробників за останній рік.',
      type: 'standard',
      status: 'done',
      priority: 'high',
      deadline: new Date('2026-05-15'),
      estimated_hours: 8,
      actual_hours: 8,
      project_id: prjBI.id,
      assignee_id: workerBE.id,
      reporter_id: admin.id,
      parent_id: adminTask1.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Узгодження бюджету на маркетинг',
      description: 'Провести зустріч із відділом маркетингу та узгодити витрати на рекламу в соціальних мережах.',
      type: 'standard',
      status: 'in_progress',
      priority: 'medium',
      deadline: new Date('2026-06-08'),
      estimated_hours: 6,
      actual_hours: 2,
      project_id: prjBI.id,
      assignee_id: mgr1.id,
      reporter_id: admin.id,
      parent_id: adminTask1.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Підготовка фінансового звіту в Excel',
      description: 'Зібрати всі дані про доходи та витрати компанії в єдину зведену таблицю.',
      type: 'standard',
      status: 'done',
      priority: 'low',
      deadline: new Date('2026-05-20'),
      estimated_hours: 4,
      actual_hours: 3,
      project_id: prjBI.id,
      assignee_id: mgr3.id,
      reporter_id: admin.id,
      parent_id: adminTask1.id,
    },
  });

  // 2. Subtasks for adminTask2
  await prisma.task.create({
    data: {
      title: 'Оцінка вартості сервісів AWS (TCO Analysis)',
      description: 'Розрахувати витрати на інфраструктуру AWS та порівняти їх із поточними витратами на локальні сервери.',
      type: 'research',
      status: 'done',
      priority: 'high',
      deadline: new Date('2026-05-25'),
      estimated_hours: 6,
      actual_hours: 6,
      project_id: prjAWS.id,
      assignee_id: workerDevOps.id,
      reporter_id: admin.id,
      parent_id: adminTask2.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Аудит безпеки хмарного сховища S3',
      description: 'Перевірити політики доступу (Bucket Policies) та увімкнути шифрування даних на рівні сховища.',
      type: 'standard',
      status: 'in_progress',
      priority: 'critical',
      deadline: new Date('2026-06-02'),
      estimated_hours: 4,
      actual_hours: 2,
      project_id: prjAWS.id,
      assignee_id: workerDevOps2.id,
      reporter_id: admin.id,
      parent_id: adminTask2.id,
    },
  });

  // 3. Subtasks for adminTask5
  await prisma.task.create({
    data: {
      title: 'Аналіз механізму ротації рефреш-токенів',
      description: 'Дослідити найкращі практики безпечного оновлення JWT токенів та запобігання повторному використанню.',
      type: 'research',
      status: 'done',
      priority: 'high',
      deadline: new Date('2026-05-18'),
      estimated_hours: 4,
      actual_hours: 4,
      project_id: prjSec.id,
      assignee_id: workerBE.id,
      reporter_id: admin.id,
      parent_id: adminTask5.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Тестування вразливості до CSRF/XSS атак',
      description: 'Перевірити форми введення даних на наявність XSS-вразливостей та переконатися в наявності CSRF-захисту.',
      type: 'testing',
      status: 'todo',
      priority: 'critical',
      deadline: new Date('2026-06-05'),
      estimated_hours: 6,
      actual_hours: 0,
      project_id: prjSec.id,
      assignee_id: workerQA.id,
      reporter_id: admin.id,
      parent_id: adminTask5.id,
    },
  });

  console.log('💬 Створення коментарів для усіх завдань...');
  const commentsData = [
    // Comments for task1 (Apple Pay)
    { task_id: task1.id, author_id: workerFE.id, content: 'Я почала вивчати офіційну документацію Apple Pay. Виявилося, що для тестування нам обов\'язково потрібен сертифікат розробника Apple Developer Account. Маріє, чи можемо ми отримати доступи?' },
    { task_id: task1.id, author_id: mgr1.id, content: 'Олено, так, звичайно! Я сьогодні ж надішлю запит у системний відділ, щоб тобі створили акаунт розробника та підключили до нашої команди.' },
    { task_id: task1.id, author_id: workerFE.id, content: 'Доступи отримала, дякую! Розпочинаю налаштування сертифікатів Merchant ID та Payment Processing Certificate.' },

    // Comments for task2 (FaceID UI)
    { task_id: task2.id, author_id: workerDesign.id, content: 'Макет FaceID готовий і завантажений у Figma в розділ компоненти. Можна брати в роботу.' },
    { task_id: task2.id, author_id: workerFE.id, content: 'Дякую, Василю! Дизайн виглядає чудово, вже верстаю екран. Анімація сканування буде плавною.' },

    // Comments for task3 (Transaction security)
    { task_id: task3.id, author_id: workerQA.id, content: 'Знайшла баг при переказі на суму більше 50 000 грн. Запит падає з помилкою 500 замість інформативного повідомлення про ліміти.' },
    { task_id: task3.id, author_id: workerBE.id, content: 'Ой, це моя провина. Я не додав перевірку лімітів на рівні DTO валідатора. Вже виправляю, за півгодини оновлю на стейджингу.' },
    { task_id: task3.id, author_id: workerQA.id, content: 'Перевірила, тепер повертає 400 з гарною помилкою про ліміт НБУ. Закриваю цей кейс!' },

    // Comments for task4 (LiqPay subscription)
    { task_id: task4.id, author_id: workerBE.id, content: 'Вивчив схему рекурентних платежів LiqPay. Для цього потрібно використовувати токен картки (card token), який генерується при першій успішній оплаті. Документація цілком зрозуміла.' },
    { task_id: task4.id, author_id: mgr2.id, content: 'Дуже добре. Сергію, зверни увагу на обробку 3D-Secure для першої транзакції, це обов\'язкова вимога нашого банку-еквайєра.' },

    // Comments for task5 (Webhook handler)
    { task_id: task5.id, author_id: workerBE.id, content: 'Реалізував endpoint вебхука. Додав валідацію сигнатури за допомогою нашого приватного ключа. Код готовий до рев\'ю.' },
    { task_id: task5.id, author_id: mgr2.id, content: 'Сергію, чудова робота! Зверни увагу на безпеку обробки сигнатур (signature) у вебхуку, щоб зловмисники не могли підробити запит про оплату.' },

    // Comments for task6 (Card layout)
    { task_id: task6.id, author_id: workerDesign.id, content: 'Форма введення карткових даних готова. Додав маски для номера картки (#### #### #### ####) та терміну дії (##/##).' },
    { task_id: task6.id, author_id: workerFE.id, content: 'Заінтегрувала форму в загальний флоу оплати. Все працює чудово, валідація відпрацьовує на льоту.' },

    // Comments for task7 (Explain CRM queries)
    { task_id: task7.id, author_id: workerBE.id, content: 'Ого, запит на отримання історії замовлень клієнта робив повне сканування таблиці (Full Table Scan) через відсутність індексу на customer_id. Додавання індексу прискорить цей запит у 150 разів!' },
    { task_id: task7.id, author_id: workerBE2.id, content: 'Круто! Я перевірю інші схожі таблиці, можливо там теж пропущені зовнішні індекси.' },

    // Comments for taskPortalDesign
    { task_id: taskPortalDesign.id, author_id: workerDesign.id, content: 'Макет темної теми виглядає дуже стильно, але є питання щодо контрастності деяких сірих текстів на темно-синьому фоні.' },
    { task_id: taskPortalDesign.id, author_id: mgr1.id, content: 'Згодна, Василю. Давай зробимо основний сірий текст трохи світлішим, щоб відповідати стандарту WCAG AA.' },

    // Comments for taskPortalNav
    { task_id: taskPortalNav.id, author_id: workerFE.id, content: 'Розпочала верстку шапки. Робимо меню фіксованим зверху (sticky) чи нехай скролиться разом із контентом?' },
    { task_id: taskPortalNav.id, author_id: mgr1.id, content: 'Краще зробити sticky з легким ефектом розмиття (backdrop-blur), це виглядає преміально і сучасно.' },

    // Comments for taskCRMIndex
    { task_id: taskCRMIndex.id, author_id: workerBE.id, content: 'Написав міграцію для додавання індексів. Потрібно запустити на тестовій базі перед продакшеном, бо таблиця містить понад 1 млн рядків.' },
    { task_id: taskCRMIndex.id, author_id: mgr2.id, content: 'Правильне рішення. Запуск робимо вночі, щоб не заблокувати таблиці для менеджерів під час робочого дня.' },

    // Comments for taskAIOpenAI
    { task_id: taskAIOpenAI.id, author_id: workerFE.id, content: 'Claude 3.5 Sonnet дає значно якісніші відповіді українською мовою, але його API приблизно на 20% повільніше ніж GPT-4o-mini.' },
    { task_id: taskAIOpenAI.id, author_id: mgr1.id, content: 'Для нас якість мови є пріоритетом. Швидкість відповіді в 2-3 секунди є цілком прийнятною для чат-бота.' },

    // Comments for taskAIPrompt
    { task_id: taskAIPrompt.id, author_id: workerFE.id, content: 'Системний промпт налаштувала. Додала декілька few-shot прикладів для покращення точності класифікації.' },
    { task_id: taskAIPrompt.id, author_id: workerFE2.id, content: 'Олено, перевірила декілька складних випадків — класифікатор чудово розрізняє технічні та фінансові скарги. Класна робота!' },

    // Comments for taskUIButtons
    { task_id: taskUIButtons.id, author_id: workerDesign.id, content: 'Додав анімації для натискання кнопок. Використав легкий scale-effect (transform active:scale-95).' },
    { task_id: taskUIButtons.id, author_id: workerFE.id, content: 'Дякую, Олено! Дуже приємний тактильний ефект на мобільних пристроях, супер!' },

    // Comments for taskUIStorybook
    { task_id: taskUIStorybook.id, author_id: workerDesign.id, content: 'Всі кольорові токени задокументовані. Додав інтерактивну колірну палітру в Storybook з можливістю копіювання HEX коду.' },

    // Comments for taskAWSECS
    { task_id: taskAWSECS.id, author_id: workerDevOps.id, content: 'Для нашого масштабу Kubernetes буде занадто складним та дорогим в обслуговуванні. Рекомендую обрати AWS ECS (Fargate).' },
    { task_id: taskAWSECS.id, author_id: mgr2.id, content: 'Згоден, Тетяно. Давай почнемо з ECS, а у разі потреби масштабування перейдемо на EKS пізніше.' },

    // Comments for taskAWSDocker
    { task_id: taskAWSDocker.id, author_id: workerDevOps.id, content: 'Оптимізувала Dockerfile. Розмір образу зменшився з 850MB до 120MB завдяки альпійській версії Node (node:alpine).' },
    { task_id: taskAWSDocker.id, author_id: workerBE.id, content: 'Неймовірний результат, це значно прискорить CI/CD білди!' },

    // Comments for taskQAPlaywright
    { task_id: taskQAPlaywright.id, author_id: workerQA.id, content: 'Налаштувала кешування браузерів у GitLab CI, щоб не завантажувати Chromium при кожному запуску папуг. Час пайплайну скоротився на 3 хвилини.' },

    // Comments for taskQAAuthTest
    { task_id: taskQAAuthTest.id, author_id: workerQA.id, content: 'Написала E2E тест для авторизації. Перевіряє як успішний вхід, так і блокування акаунту після 5 невдалих спроб.' },

    // Comments for taskBIDAUMAU
    { task_id: taskBIDAUMAU.id, author_id: workerFE.id, content: 'Додала графік Recharts для DAU. Інтерактивні тултіпи показують точні значення при наведенні курсору.' },
    { task_id: taskBIDAUMAU.id, author_id: mgr2.id, content: 'Дуже інформативно, Олено! Давай ще додамо можливість фільтрації за останні 7, 30 та 90 днів.' },

    // Comments for taskSecSecrets
    { task_id: taskSecSecrets.id, author_id: workerDevOps.id, content: 'Запустила TruffleHog. На щастя, жодних секретів у Git-історії не знайдено. Всі API-ключі беруться виключно з env-змінних.' },

    // Comments for taskSecHTTPS
    { task_id: taskSecHTTPS.id, author_id: workerDevOps.id, content: 'Налаштувала Let\'s Encrypt та додала cron-task для автоматичного оновлення сертифікатів кожні 60 днів.' },

    // Comments for taskLiqPayAuditFix
    { task_id: taskLiqPayAuditFix.id, author_id: workerBE.id, content: 'Виправив алгоритм підпису сигнатури. Тепер використовується виключно шифрування SHA-1 разом із приватним ключем, як вимагає LiqPay.' },
    { task_id: taskLiqPayAuditFix.id, author_id: workerQA.id, content: 'Перевірила транзакції на тестовому середовищі LiqPay. Всі платежі проходять успішно, сигнатури валідні. Зауваження аудиту виправлено!' },

    // Comments for taskZodSchemas
    { task_id: taskZodSchemas.id, author_id: workerBE.id, content: 'Zod-схеми для коментарів повністю покривають валідацію довжини тексту та перевірку ID задачі. Додав обробку помилок.' },
    { task_id: taskZodSchemas.id, author_id: workerFE.id, content: 'Сергію, чудово! Тепер при помилці валідації фронтенд отримує структурований JSON із помилками для кожного поля.' },

    // Comments for taskRedisProjects
    { task_id: taskRedisProjects.id, author_id: workerBE2.id, content: 'Інтегрував Redis кеш. Час відповіді для отримання списку проектів впав з 120мс до 8мс!' },
    { task_id: taskRedisProjects.id, author_id: workerBE.id, content: 'Неймовірне прискорення! Не забудь додати інвалідацію кешу при створенні або оновленні проекту.' },

    // Comments for taskPortalUploadDesign
    { task_id: taskPortalUploadDesign.id, author_id: workerDesign2.id, content: 'Макет сторінки завантаження файлів намалювала. Додала відображення прогрес-бару для кожного файлу окремо.' },

    // Comments for taskPortalProfileFE
    { task_id: taskPortalProfileFE.id, author_id: workerFE2.id, content: 'Працюю над сторінкою профілю. Додала кроппер для аватарок, щоб користувачі могли обрізати фото перед завантаженням.' },

    // Comments for taskAWSDockerCompose
    { task_id: taskAWSDockerCompose.id, author_id: workerDevOps2.id, content: 'Створив docker-compose файл. Тепер розробники можуть розгорнути все локальне оточення однією командою docker compose up -d.' },

    // Comments for taskSecRateLimiting
    { task_id: taskSecRateLimiting.id, author_id: workerBE3.id, content: 'Додав rate limiter на auth-ендпоінти. Дозволено максимум 10 спроб входу за 15 хвилин з однієї IP адреси.' },

    // Comments for taskMobileSubtaskTree
    { task_id: taskMobileSubtaskTree.id, author_id: workerFE.id, content: 'React-компонент дерева підзадач повністю готовий. Додала підтримку drag-and-drop для зміни черговості підзадач.' },

    // Comments for taskCRMCaching
    { task_id: taskCRMCaching.id, author_id: workerBE2.id, content: 'Дослідив стратегії кешування Redis. Будемо використовувати Cache-Aside патерн як найбільш надійний для CRM.' },

    // Comments for taskPortalGDPR
    { task_id: taskPortalGDPR.id, author_id: admin.id, content: 'Підготував звіт щодо вимог GDPR. Обов\'язково маємо додати кнопку згоди з файлами cookie та можливість повного видалення акаунту на вимогу.' },

    // Comments for taskAILlama3
    { task_id: taskAILlama3.id, author_id: workerBE3.id, content: 'Локальна модель Llama-3 працює, але швидкість генерації на 8B параметрів становить близько 15 токенів на секунду, що трохи повільно.' },
    { task_id: taskAILlama3.id, author_id: workerBE.id, content: 'Романе, спробуй увімкнути квантизацію моделі до 4-х біт (Q4_K_M). Це має прискорити генерацію вдвічі без значної втрати якості.' },

    // Comments for taskSecWAF
    { task_id: taskSecWAF.id, author_id: workerDevOps2.id, content: 'Порівняв Cloudflare WAF та AWS WAF. Cloudflare є простішим у налаштуванні та пропонує безкоштовний базовий рівень захисту від DDoS.' },

    // Comments for taskSecJWTRotation
    { task_id: taskSecJWTRotation.id, author_id: workerQA.id, content: 'Написала тести для перевірки ротації токенів. Виявила баг: при одночасному відправленні двох запитів на рефреш один з них блокувався.' },
    { task_id: taskSecJWTRotation.id, author_id: workerBE.id, content: 'Так, це класична проблема race condition при ротації. Вже додав grace period у 10 секунд для старих refresh-токенів.' },

    // Comments for taskMobileRegression
    { task_id: taskMobileRegression.id, author_id: workerQA2.id, content: 'Розпочали регресію мобільного банку. Перевірили 45 тест-кейсів, поки виявили лише 2 дрібних UI баги.' },

    // Comments for taskLiqPayPlaywright
    { task_id: taskLiqPayPlaywright.id, author_id: workerQA.id, content: 'Playwright тести для оплати повністю готові та стабільно проходять на тестових картках LiqPay Sandbox.' },

    // Comments for taskCRMLoad
    { task_id: taskCRMLoad.id, author_id: workerQA2.id, content: 'Навантажувальний тест завершено. База даних CRM витримує 3500 одночасних користувачів, після чого час відповіді починає перевищувати 2 секунди.' },

    // Comments for taskAWSMigrationQA
    { task_id: taskAWSMigrationQA.id, author_id: workerQA2.id, content: 'Склала детальний чек-лист для перевірки міграції бази. Включає звірку кількості рядків у всіх таблицях та підрахунок контрольних сум.' },

    // Comments for taskSecAuthPenTest
    { task_id: taskSecAuthPenTest.id, author_id: workerQA.id, content: 'Сканування через OWASP ZAP не виявило критичних вразливостей (SQL, Command Injection). Є лише кілька попереджень низького рівня щодо заголовків безпеки.' },

    // Comments for taskMobilePlanning
    { task_id: taskMobilePlanning.id, author_id: mgr1.id, content: 'Архітектуру модулів авторизації затверджено на загальному мітингу. Протокол зустрічі завантажено в Confluence.' },

    // Comments for taskPortalRoadmap
    { task_id: taskPortalRoadmap.id, author_id: mgr1.id, content: 'Дорожня карта редизайну готова. Розділили проект на 3 спринти по 2 тижні кожен.' },

    // Comments for taskLiqPayPlan
    { task_id: taskLiqPayPlan.id, author_id: mgr2.id, content: 'План інтеграції LiqPay повністю узгоджено з фінансовим директором. Отримали бойові API ключі.' },

    // Comments for taskCRMPlanning
    { task_id: taskCRMPlanning.id, author_id: mgr2.id, content: 'Запланували роботи з оптимізації бази на суботу з 02:00 до 05:00, щоб мінімізувати вплив на клієнтів.' },

    // Comments for taskAIPlanning
    { task_id: taskAIPlanning.id, author_id: mgr3.id, content: 'Зібрали перші 50 частих запитань від служби підтримки. Будемо використовувати їх як базу для навчання нашого AI асистента.' },

    // Comments for taskAWSPlanning
    { task_id: taskAWSPlanning.id, author_id: workerDevOps.id, content: 'Розрахувала очікуваний бюджет на AWS. Загальні витрати складуть близько $350 на місяць, що повністю вписується в ліміти.' },

    // Comments for adminTask1
    { task_id: adminTask1.id, author_id: mgr1.id, content: 'Звіт по маркетингу готовий, завантажила на спільний диск. Будь ласка, перегляньте фінальні цифри.' },
    { task_id: adminTask1.id, author_id: admin.id, content: 'Дякую, Маріє. Цифри виглядають цілком адекватно. Треба ще обов\'язково додати витрати на ліцензії Jira/Confluence та GitHub Enterprise.' },
    { task_id: adminTask1.id, author_id: mgr1.id, content: 'Зрозуміла, внесу ці витрати в таблицю сьогодні до кінця дня.' },

    // Comments for adminTask2
    { task_id: adminTask2.id, author_id: workerDevOps.id, content: 'Я підготувала аналіз ризиків міграції. Найбільший ризик — це можливий downtime бази даних при перенесенні. Пропоную використати AWS Database Migration Service для міграції без зупинки роботи.' },
    { task_id: adminTask2.id, author_id: admin.id, content: 'Чудова ідея, Тетяно! Використання AWS DMS дійсно дозволить провести реплікацію даних у реальному часі та перемкнути DNS з мінімальною паузою.' },

    // Comments for adminTask5
    { task_id: adminTask5.id, author_id: workerBE.id, content: 'Я провів рев\'ю коду авторизації. Виявилося, що рефреш-токени зберігалися в LocalStorage замість безпечних HttpOnly cookies. Вже переписав логіку.' },
    { task_id: adminTask5.id, author_id: workerQA.id, content: 'Чудово, Сергію! Я перевірю цю вразливість сьогодні на стейджинг-сервері під час E2E тестів.' },
    { task_id: adminTask5.id, author_id: admin.id, content: 'Надзвичайно критичний баг, дякую за швидке реагування, колеги. Зберігання в LocalStorage дійсно створювало ризик XSS витоку. Чекаю фінального підтвердження від QA.' },

    // Comments for adminTask6
    { task_id: adminTask6.id, author_id: workerBE2.id, content: 'Сергію, у нас пікове навантаження на базу щодня о 12:00. Потрібно налаштувати реплікацію (Read Replica) для генерації важких аналітичних звітів.' },
    { task_id: adminTask6.id, author_id: admin.id, content: 'Згоден, це розвантажить основну мастер-базу та суттєво прискорить CRM. Сергію, допоможи Дмитру з налаштуванням індексів у міграціях.' },
    { task_id: adminTask6.id, author_id: workerBE.id, content: 'Вже працюємо над цим. Створили Read-Only підключення в Prisma Client, зараз тестуємо локально.' },

    // Comments for adminTask7
    { task_id: adminTask7.id, author_id: workerFE.id, content: 'Макет профілю повністю зверстаний. Додала можливість вибору теми та зміни аватару. Залишилося підключити оновлення паролю.' },
    { task_id: adminTask7.id, author_id: admin.id, content: 'Дуже гарна верстка, Олено! Давай додамо перевірку складності паролю на фронтенді (мінімум 8 символів, велика літера та спецсимвол).' }
  ];

  for (const c of commentsData) {
    await prisma.comment.create({
      data: c,
    });
  }

  console.log('✅ Коментарі додано.');
  console.log('🎉 БАЗУ ДАНИХ УСПІШНО ЗАПОВНЕНО РЕАЛІСТИЧНИМИ ДАНИМИ!');
}

main()
  .catch((e) => {
    console.error('❌ Помилка під час заповнення бази даних:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
