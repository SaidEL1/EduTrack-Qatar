import { EmailTemplateService } from '../../src/modules/notification/application/email-template.service.js';

describe('EmailTemplateService', () => {
  const service = new EmailTemplateService();

  it('renders email verification template', () => {
    const rendered = service.render('email_verification', {
      link: 'https://example.com/verify',
    });
    expect(rendered.subject).toContain('Verify');
    expect(rendered.bodyText).toContain('https://example.com/verify');
  });

  it('renders password reset template', () => {
    const rendered = service.render('password_reset', {
      link: 'https://example.com/reset',
    });
    expect(rendered.subject).toContain('Reset');
    expect(rendered.bodyHtml).toContain('https://example.com/reset');
  });

  it('renders user invitation template', () => {
    const rendered = service.render('user_invitation', {
      link: 'https://example.com/invite',
      tenantName: 'Qatar Academy',
    });
    expect(rendered.subject).toContain('Qatar Academy');
    expect(rendered.bodyText).toContain('https://example.com/invite');
  });
});
