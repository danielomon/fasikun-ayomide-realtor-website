/* FAQ accordion + lead form submission, used across pages. */

document.addEventListener('DOMContentLoaded', () => {
  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if (!btn || !answer) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((other) => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // Lead capture form (used on Contact page, and any embedded consultation forms)
  document.querySelectorAll('form[data-lead-form]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalLabel = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      const formData = new FormData(form);
      const payload = {
        name: formData.get('name'),
        phoneOrEmail: formData.get('phoneOrEmail'),
        interest: formData.get('interest') || '',
        message: formData.get('message') || '',
        source: window.location.pathname,
      };

      try {
       const res = await fetch('https://fasikun-ayomide-realtor-website.onrender.com/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Request failed');

        const successBox = form.parentElement.querySelector('.form-success');
        if (successBox) successBox.classList.add('show');
        form.reset();

        // Also offer a direct WhatsApp follow-up with their details pre-filled
        const waMsg = `Hi Ayomide, I just submitted an enquiry on your website.\nName: ${payload.name}\nInterest: ${payload.interest || 'General enquiry'}\nMessage: ${payload.message || '-'}`;
        const waBtn = form.parentElement.querySelector('[data-wa-followup]');
        if (waBtn) waBtn.href = waLink(waMsg);
      } catch (err) {
        alert("Something went wrong sending your message. Please try WhatsApp instead — it's faster anyway.");
      } finally {
        submitBtn.textContent = originalLabel;
        submitBtn.disabled = false;
      }
    });
  });
});
