const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLScVlr1CBbJDIQFR8pNjgcPwsn0BJv1cu5yLzQ3pRCHKy5hE-Q/formResponse';
const GOOGLE_FORM_ENTRIES = { name: 'entry.987879063', email: 'entry.1879893932', message: 'entry.569347642' };
const contactForm = document.querySelector('#contact-form');
const contactSubmitButton = contactForm?.querySelector('button[type="submit"]');
const contactSubmitLabel = contactSubmitButton?.innerHTML;
contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const googleFormData = new URLSearchParams();
  googleFormData.append(GOOGLE_FORM_ENTRIES.name, formData.get('name'));
  googleFormData.append(GOOGLE_FORM_ENTRIES.email, formData.get('email'));
  googleFormData.append(GOOGLE_FORM_ENTRIES.message, formData.get('message'));
  if (contactSubmitButton) { contactSubmitButton.disabled = true; contactSubmitButton.textContent = '送出中...'; }
  try {
    await fetch(GOOGLE_FORM_ACTION, { method: 'POST', mode: 'no-cors', body: googleFormData });
    if (contactSubmitButton) contactSubmitButton.textContent = '已送出，謝謝！';
    contactForm.reset();
  } catch (error) {
    if (contactSubmitButton) contactSubmitButton.textContent = '送出失敗，請直接寄信給我';
  } finally {
    setTimeout(() => { if (contactSubmitButton) { contactSubmitButton.disabled = false; contactSubmitButton.innerHTML = contactSubmitLabel; } }, 4000);
  }
});
