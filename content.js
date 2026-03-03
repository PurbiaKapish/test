// 1) Create a reusable props panel in a Shadow DOM (isolated styles)
(function setupPropsPanel() {
  // Host + shadow (isolated from page CSS)
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.zIndex = "2147483647";
  host.style.pointerEvents = "none";
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  // Overlay
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,.55)",
    opacity: "0",
    pointerEvents: "none",
    transition: "opacity .15s ease"
  });

  // Modal (ALL inline so site CSS can't affect it)
  const modal = document.createElement("div");
  Object.assign(modal.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    width: "380px",
    maxWidth: "calc(100vw - 32px)",
    maxHeight: "calc(100vh - 32px)",
    overflow: "auto",
    background: "#ffffff",
    color: "#0f172a",
    borderRadius: "16px",
    boxShadow: "0 20px 50px rgba(16,24,40,.25)",
    padding: "20px",
    font: "14px/1.45 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
  });

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  Object.assign(closeBtn.style, {
    position: "absolute", top: "10px", right: "12px",
    width: "32px", height: "32px", border: "none",
    background: "transparent", fontSize: "20px", cursor: "pointer", color: "#475569"
  });

  // Title
  const h1 = document.createElement("h1");
  h1.textContent = "SellerRadar Login";
  Object.assign(h1.style, { margin: "0 0 16px", fontSize: "22px", fontWeight: "800" });

  // Form
  const form = document.createElement("form");
  form.setAttribute("autocomplete", "off");
  form.setAttribute("novalidate", "");
  form.style.display = "grid";
  form.style.rowGap = "12px";

  const labelEmail = document.createElement("label");
  labelEmail.textContent = "Email";
  Object.assign(labelEmail.style, { fontSize: "12px", color: "#6b7280" });

  const email = document.createElement("input");
  Object.assign(email, { id: "email", type: "email", placeholder: "Enter email address", required: true });
  Object.assign(email.style, {
    height: "25px", padding: "10px 12px", borderRadius: "12px",
    border: "1px solid #e5e7eb", background: "#fff", color: "#0f172a",
    outline: "none"
  });

  email.addEventListener("focus", () => {
    email.style.border = "1px solid #2563eb";
    email.style.boxShadow = "0 0 0 3px #93c5fd";
  });

  email.addEventListener("blur", () => {
    email.style.border = "1px solid #e5e7eb";
    email.style.boxShadow = "none";
  });

  const labelPass = document.createElement("label");

  labelPass.textContent = "Password";
  Object.assign(labelPass.style, { fontSize: "12px", color: "#6b7280" });

  const password = document.createElement("input");

  Object.assign(password, { id: "password", type: "password", placeholder: "Enter password", required: true });
  Object.assign(password.style, {
    height: "25px", padding: "10px 12px", borderRadius: "12px",
    border: "1px solid #e5e7eb", background: "#fff", color: "#0f172a",
    outline: "none"
  });

  password.addEventListener("focus", () => {
    password.style.border = "1px solid #2563eb";
    password.style.boxShadow = "0 0 0 3px #93c5fd";
  });

  password.addEventListener("blur", () => {
    password.style.border = "1px solid #e5e7eb";
    password.style.boxShadow = "none";
  });

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.textContent = "Sign in";
  Object.assign(btn.style, {
    width: "100%", height: "44px", marginTop: "8px",
    borderRadius: "12px", border: "0", background: "#2563eb",
    color: "#fff", fontWeight: "700", cursor: "pointer"
  });
  btn.addEventListener("mouseover", () => { btn.style.background = "#1d4ed8"; });
  btn.addEventListener("mouseout", () => { btn.style.background = "#2563eb"; });

  // Link to switch to sign-up
  const signUpLink = document.createElement("p");
  signUpLink.innerHTML = `Don't have an account? <a href="#" style="color:#2563eb;font-weight:600;text-decoration:none;">Create one</a>`;
  Object.assign(signUpLink.style, { fontSize: "13px", textAlign: "center", marginTop: "12px", color: "#6b7280" });

  const msg = document.createElement("p");
  Object.assign(msg.style, { minHeight: "18px", fontSize: "12px", marginTop: "8px", color: "#6b7280" });

  // ========== SIGN-UP FORM ==========
  const signupForm = document.createElement("form");
  signupForm.setAttribute("autocomplete", "off");
  signupForm.setAttribute("novalidate", "");
  signupForm.style.display = "none"; // hidden by default
  signupForm.style.rowGap = "10px";

  // Full Name
  const labelFullName = document.createElement("label");
  labelFullName.textContent = "Full Name";
  Object.assign(labelFullName.style, { fontSize: "12px", color: "#6b7280" });

  const fullNameInput = document.createElement("input");
  Object.assign(fullNameInput, { id: "signup_fullname", type: "text", placeholder: "Enter your full name", required: true });
  Object.assign(fullNameInput.style, {
    height: "25px", padding: "10px 12px", borderRadius: "12px",
    border: "1px solid #e5e7eb", background: "#fff", color: "#0f172a", outline: "none"
  });

  // Email
  const labelSignupEmail = document.createElement("label");
  labelSignupEmail.textContent = "Email";
  Object.assign(labelSignupEmail.style, { fontSize: "12px", color: "#6b7280" });

  const signupEmailInput = document.createElement("input");
  Object.assign(signupEmailInput, { id: "signup_email", type: "email", placeholder: "Enter email address", required: true });
  Object.assign(signupEmailInput.style, {
    height: "25px", padding: "10px 12px", borderRadius: "12px",
    border: "1px solid #e5e7eb", background: "#fff", color: "#0f172a", outline: "none"
  });

  // Mobile
  const labelMobile = document.createElement("label");
  labelMobile.textContent = "Mobile Number";
  Object.assign(labelMobile.style, { fontSize: "12px", color: "#6b7280" });

  const mobileInput = document.createElement("input");
  Object.assign(mobileInput, { id: "signup_mobile", type: "tel", placeholder: "Enter mobile number", required: true });
  Object.assign(mobileInput.style, {
    height: "25px", padding: "10px 12px", borderRadius: "12px",
    border: "1px solid #e5e7eb", background: "#fff", color: "#0f172a", outline: "none"
  });

  // Password
  const labelSignupPass = document.createElement("label");
  labelSignupPass.textContent = "Password";
  Object.assign(labelSignupPass.style, { fontSize: "12px", color: "#6b7280" });

  const signupPassInput = document.createElement("input");
  Object.assign(signupPassInput, { id: "signup_password", type: "password", placeholder: "Min 6 characters", required: true });
  Object.assign(signupPassInput.style, {
    height: "25px", padding: "10px 12px", borderRadius: "12px",
    border: "1px solid #e5e7eb", background: "#fff", color: "#0f172a", outline: "none"
  });

  // Confirm Password
  const labelConfirmPass = document.createElement("label");
  labelConfirmPass.textContent = "Confirm Password";
  Object.assign(labelConfirmPass.style, { fontSize: "12px", color: "#6b7280" });

  const confirmPassInput = document.createElement("input");
  Object.assign(confirmPassInput, { id: "signup_confirm_password", type: "password", placeholder: "Re-enter password", required: true });
  Object.assign(confirmPassInput.style, {
    height: "25px", padding: "10px 12px", borderRadius: "12px",
    border: "1px solid #e5e7eb", background: "#fff", color: "#0f172a", outline: "none"
  });

  // Submit button
  const signupBtn = document.createElement("button");
  signupBtn.type = "submit";
  signupBtn.textContent = "Create Account";
  Object.assign(signupBtn.style, {
    width: "100%", height: "44px", marginTop: "8px",
    borderRadius: "12px", border: "0", background: "#16a34a",
    color: "#fff", fontWeight: "700", cursor: "pointer"
  });
  signupBtn.addEventListener("mouseover", () => { signupBtn.style.background = "#15803d"; });
  signupBtn.addEventListener("mouseout", () => { signupBtn.style.background = "#16a34a"; });

  // Link to switch back to login
  const signInLink = document.createElement("p");
  signInLink.innerHTML = `Already have an account? <a href="#" style="color:#2563eb;font-weight:600;text-decoration:none;">Sign in</a>`;
  Object.assign(signInLink.style, { fontSize: "13px", textAlign: "center", marginTop: "12px", color: "#6b7280" });

  const signupMsg = document.createElement("p");
  Object.assign(signupMsg.style, { minHeight: "18px", fontSize: "12px", marginTop: "8px", color: "#6b7280" });

  signupForm.append(
    labelFullName, fullNameInput,
    labelSignupEmail, signupEmailInput,
    labelMobile, mobileInput,
    labelSignupPass, signupPassInput,
    labelConfirmPass, confirmPassInput,
    signupBtn, signInLink, signupMsg
  );

  // Toggle between login and signup
  signUpLink.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    form.style.display = "none";
    signupForm.style.display = "grid";
    h1.textContent = "Create Account";
    msg.textContent = "";
  });

  signInLink.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    signupForm.style.display = "none";
    form.style.display = "grid";
    h1.textContent = "SellerRadar Login";
    signupMsg.textContent = "";
  });

  // Logged-in block container (initially hidden)
  const accountBox = document.createElement("div");
  Object.assign(accountBox.style, {
    display: "none",
    displayDirection: "column",
    rowGap: "10px",
    paddingTop: "10px"
  });

  // Name
  const nameLabel = document.createElement("p");
  Object.assign(nameLabel.style, { fontWeight: "700", margin: "8" });

  // Email
  const emailLabel = document.createElement("p");
  Object.assign(emailLabel.style, { fontSize: "13px", color: "#475569", margin: "4" });


  // Plan Expire
  const planExpireLabel = document.createElement("p");
  Object.assign(planExpireLabel.style, { fontSize: "13px", color: "#475569", margin: "4" });

  // ========== PRICING PANEL ==========
  const pricingBox = document.createElement("div");
  pricingBox.style.display = "none";

  const pricingTitle = document.createElement("h2");
  pricingTitle.textContent = "Choose Your Plan";
  Object.assign(pricingTitle.style, { fontSize: "18px", fontWeight: "700", marginBottom: "16px", textAlign: "center" });

  const plansContainer = document.createElement("div");
  Object.assign(plansContainer.style, { display: "flex", flexDirection: "column", gap: "12px" });

  const plansLoading = document.createElement("p");
  plansLoading.textContent = "Loading plans...";
  Object.assign(plansLoading.style, { textAlign: "center", color: "#6b7280" });

  let selectedPlan = null;

  function renderPlans(plans) {
    plansContainer.innerHTML = "";
    plans.forEach(plan => {
      const card = document.createElement("div");
      Object.assign(card.style, {
        padding: "16px", borderRadius: "12px",
        border: "2px solid #e5e7eb", background: "#f9fafb",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        cursor: "pointer", transition: "all 0.2s"
      });

      const left = document.createElement("div");
      const planName = document.createElement("p");
      planName.textContent = plan.name;
      Object.assign(planName.style, { fontWeight: "700", fontSize: "15px", marginBottom: "2px" });
      const planDur = document.createElement("p");
      planDur.textContent = plan.duration;
      Object.assign(planDur.style, { fontSize: "12px", color: "#6b7280" });
      left.append(planName, planDur);

      const right = document.createElement("div");
      right.style.textAlign = "right";
      const price = document.createElement("p");
      price.textContent = "₹" + plan.total.toLocaleString();
      Object.assign(price.style, { fontWeight: "800", fontSize: "18px", color: "#1e293b" });
      const gst = document.createElement("p");
      gst.textContent = "incl. 18% GST";
      Object.assign(gst.style, { fontSize: "10px", color: "#9ca3af" });
      right.append(price, gst);

      card.append(left, right);

      card.addEventListener("click", () => {
        selectedPlan = plan;
        openPaymentPanel(plan);
      });

      card.addEventListener("mouseover", () => {
        card.style.borderColor = "#2563eb";
        card.style.background = "#eff6ff";
      });
      card.addEventListener("mouseout", () => {
        card.style.borderColor = "#e5e7eb";
        card.style.background = "#f9fafb";
      });

      plansContainer.appendChild(card);
    });
  }

  function fetchPlans() {
    plansContainer.innerHTML = "";
    plansContainer.appendChild(plansLoading);

    chrome.runtime.sendMessage({ type: "get_plans" }, (resp) => {
      if (!resp || !resp.ok) {
        plansLoading.textContent = resp?.error || "Failed to load plans";
        plansLoading.style.color = "#dc2626";
        return;
      }
      renderPlans(resp.data.plans);
    });
  }

  const backToAccountBtn = document.createElement("button");
  backToAccountBtn.textContent = "← Back";
  Object.assign(backToAccountBtn.style, {
    marginTop: "16px", padding: "10px", width: "100%",
    background: "transparent", border: "1px solid #e5e7eb",
    borderRadius: "10px", cursor: "pointer", color: "#64748b", fontWeight: "600"
  });

  pricingBox.append(pricingTitle, plansContainer, backToAccountBtn);

  // ========== PAYMENT PANEL ==========
  const paymentBox = document.createElement("div");
  paymentBox.style.display = "none";

  const paymentTitle = document.createElement("h2");
  Object.assign(paymentTitle.style, { fontSize: "16px", fontWeight: "700", marginBottom: "12px", textAlign: "center" });

  const qrContainer = document.createElement("div");
  Object.assign(qrContainer.style, { textAlign: "center", marginBottom: "16px" });

  const qrImg = document.createElement("img");
  Object.assign(qrImg.style, { width: "180px", height: "180px", borderRadius: "12px", border: "2px solid #e5e7eb" });

  const scanText = document.createElement("p");
  scanText.textContent = "Scan with any UPI app";
  Object.assign(scanText.style, { fontSize: "11px", color: "#6b7280", marginTop: "8px" });

  qrContainer.append(qrImg, scanText);

  const amountDisplay = document.createElement("div");
  Object.assign(amountDisplay.style, {
    background: "#1e293b", color: "#fff", borderRadius: "10px",
    padding: "12px", textAlign: "center", marginBottom: "16px"
  });
  const amountLabel = document.createElement("p");
  amountLabel.textContent = "Total Amount";
  Object.assign(amountLabel.style, { fontSize: "11px", opacity: "0.7" });
  const amountValue = document.createElement("p");
  Object.assign(amountValue.style, { fontSize: "22px", fontWeight: "800" });
  amountDisplay.append(amountLabel, amountValue);

  // Payment form
  const paymentForm = document.createElement("form");
  paymentForm.style.display = "grid";
  paymentForm.style.rowGap = "10px";

  const labelGst = document.createElement("label");
  labelGst.textContent = "GST Number (Optional)";
  Object.assign(labelGst.style, { fontSize: "12px", color: "#6b7280" });

  const gstInput = document.createElement("input");
  Object.assign(gstInput, { type: "text", placeholder: "e.g., 24AAICB7908D1ZU" });
  Object.assign(gstInput.style, {
    height: "25px", padding: "10px 12px", borderRadius: "10px",
    border: "1px solid #e5e7eb", background: "#fff", color: "#0f172a", outline: "none"
  });

  const labelTxn = document.createElement("label");
  labelTxn.textContent = "UPI Transaction ID *";
  Object.assign(labelTxn.style, { fontSize: "12px", color: "#6b7280" });

  const txnInput = document.createElement("input");
  Object.assign(txnInput, { type: "text", placeholder: "12-digit UTR number", required: true });
  Object.assign(txnInput.style, {
    height: "25px", padding: "10px 12px", borderRadius: "10px",
    border: "1px solid #e5e7eb", background: "#fff", color: "#0f172a", outline: "none"
  });

  const submitPaymentBtn = document.createElement("button");
  submitPaymentBtn.type = "submit";
  submitPaymentBtn.textContent = "Submit Payment";
  Object.assign(submitPaymentBtn.style, {
    width: "100%", height: "42px", marginTop: "6px",
    borderRadius: "10px", border: "0", background: "#10b981",
    color: "#fff", fontWeight: "700", cursor: "pointer"
  });

  const paymentMsg = document.createElement("p");
  Object.assign(paymentMsg.style, { fontSize: "12px", textAlign: "center", marginTop: "6px" });

  const backToPlansBtn = document.createElement("button");
  backToPlansBtn.type = "button";
  backToPlansBtn.textContent = "← Back to Plans";
  Object.assign(backToPlansBtn.style, {
    marginTop: "10px", padding: "10px", width: "100%",
    background: "transparent", border: "1px solid #e5e7eb",
    borderRadius: "10px", cursor: "pointer", color: "#64748b", fontWeight: "600"
  });

  paymentForm.append(labelGst, gstInput, labelTxn, txnInput, submitPaymentBtn, paymentMsg, backToPlansBtn);
  paymentBox.append(paymentTitle, qrContainer, amountDisplay, paymentForm);

  // View Plans button - opens pricing panel
  const viewPlansBtn = document.createElement("button");
  viewPlansBtn.textContent = "View Plans";
  Object.assign(viewPlansBtn.style, {
    width: "100%", height: "40px",
    borderRadius: "12px", border: "0",
    background: "#2563eb", color: "#fff",
    fontWeight: "700", cursor: "pointer", marginTop: "12px"
  });
  viewPlansBtn.addEventListener("mouseover", () => viewPlansBtn.style.background = "#1d4ed8");
  viewPlansBtn.addEventListener("mouseout", () => viewPlansBtn.style.background = "#2563eb");
  viewPlansBtn.addEventListener("click", () => {
    openPricingPanel();
  });

  // Logout button
  const logoutBtn = document.createElement("button");
  logoutBtn.textContent = "Logout";
  Object.assign(logoutBtn.style, {
    width: "100%", height: "40px",
    borderRadius: "12px", border: "0",
    background: "#dc2626", color: "#fff",
    fontWeight: "700", cursor: "pointer", marginTop: "8px"
  });
  logoutBtn.addEventListener("mouseover", () => logoutBtn.style.background = "#b91c1c");
  logoutBtn.addEventListener("mouseout", () => logoutBtn.style.background = "#dc2626");

  logoutBtn.addEventListener("click", async () => {
    await onLogout();
    openSignInPanel();
  });
  // Add elements
  accountBox.append(nameLabel, emailLabel, planExpireLabel, viewPlansBtn, logoutBtn);

  // Navigation functions
  function openPricingPanel() {
    if (pricingBox.style.display === "block") return;
    accountBox.style.display = "none";
    form.style.display = "none";
    signupForm.style.display = "none";
    paymentBox.style.display = "none";
    pricingBox.style.display = "block";
    h1.textContent = "Pricing";
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
    host.style.pointerEvents = "auto";
    fetchPlans();
  }

  function openPaymentPanel(plan) {
    pricingBox.style.display = "none";
    paymentBox.style.display = "block";
    paymentTitle.textContent = plan.name + " Plan";

    // Use UPI data already included in plan
    amountValue.textContent = "₹" + plan.total.toLocaleString();
    qrImg.src = plan.qr_url;

    // Reset form visibility (in case success box was shown)
    qrContainer.style.display = "block";
    amountDisplay.style.display = "block";
    paymentForm.style.display = "grid";
    submitPaymentBtn.disabled = false;

    // Remove any existing success box
    const existingSuccessBox = paymentBox.querySelector(".success-box");
    if (existingSuccessBox) existingSuccessBox.remove();

    // Clear form
    gstInput.value = "";
    txnInput.value = "";
    paymentMsg.textContent = "";
    h1.textContent = "Payment";
  }

  backToAccountBtn.addEventListener("click", async () => {
    pricingBox.style.display = "none";
    // accountBox.style.display = "block"; // openInfoInPanel will handle this
    // h1.textContent = "Account";        // openInfoInPanel will handle this

    // Fetch latest data to populate labels
    const { loggedIn, email, full_name, plan_expire } = await checkAuth();
    if (loggedIn) {
      openInfoInPanel(email, full_name, plan_expire);
    } else {
      openSignInPanel();
    }
  });

  backToPlansBtn.addEventListener("click", () => {
    paymentBox.style.display = "none";
    pricingBox.style.display = "block";
    h1.textContent = "Pricing";
  });

  // Payment form submit
  paymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const txnId = txnInput.value.trim();
    const gstNum = gstInput.value.trim();

    if (!txnId || txnId.length < 6) {
      paymentMsg.style.color = "#dc2626";
      paymentMsg.textContent = "Please enter a valid Transaction ID";
      return;
    }

    paymentMsg.style.color = "#6b7280";
    paymentMsg.textContent = "Submitting payment...";
    submitPaymentBtn.disabled = true;

    chrome.runtime.sendMessage({
      type: "submit_payment",
      payload: {
        plan: selectedPlan.id,
        transaction_id: txnId,
        gst_number: gstNum || null
      }
    }, (resp) => {
      if (!resp || !resp.ok || resp?.data?.detail) {
        paymentMsg.style.color = "#dc2626";
        paymentMsg.textContent = resp?.data?.detail || resp?.error || "Payment failed";
        submitPaymentBtn.disabled = false;
        return;
      }

      // Success! Hide form and show success message
      qrContainer.style.display = "none";
      amountDisplay.style.display = "none";
      paymentForm.style.display = "none";

      // Create success display
      const successBox = document.createElement("div");
      successBox.className = "success-box";
      Object.assign(successBox.style, {
        textAlign: "center", padding: "20px"
      });

      const checkIcon = document.createElement("div");
      checkIcon.textContent = "✓";
      Object.assign(checkIcon.style, {
        width: "60px", height: "60px", borderRadius: "50%",
        background: "#10b981", color: "#fff", fontSize: "32px",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px"
      });

      const successTitle = document.createElement("p");
      successTitle.textContent = "Payment Submitted!";
      Object.assign(successTitle.style, { fontWeight: "700", fontSize: "18px", marginBottom: "8px", color: "#10b981" });

      const successMsg = document.createElement("p");
      successMsg.textContent = resp.data?.message || "Your payment will be verified within 4 hours.";
      Object.assign(successMsg.style, { fontSize: "13px", color: "#6b7280", marginBottom: "20px" });

      const doneBtn = document.createElement("button");
      doneBtn.textContent = "Done";
      Object.assign(doneBtn.style, {
        padding: "12px 32px", borderRadius: "10px", border: "0",
        background: "#1e293b", color: "#fff", fontWeight: "700", cursor: "pointer"
      });
      doneBtn.addEventListener("click", async () => {
        // Reset and go back to account
        successBox.remove();
        qrContainer.style.display = "block";
        amountDisplay.style.display = "block";
        paymentForm.style.display = "grid";
        paymentBox.style.display = "none";

        // Fetch latest data (maybe payment updated something?) and show account
        const { loggedIn, email, full_name, plan_expire } = await checkAuth();
        if (loggedIn) {
          openInfoInPanel(email, full_name, plan_expire);
        } else {
          openSignInPanel();
        }
      });

      successBox.append(checkIcon, successTitle, successMsg, doneBtn);
      paymentBox.appendChild(successBox);
    });
  });


  // Compose
  form.append(labelEmail, email, labelPass, password, btn, signUpLink);
  modal.append(closeBtn, h1, form, signupForm, accountBox, pricingBox, paymentBox, msg);
  overlay.appendChild(modal);
  shadow.appendChild(overlay);

  // Open/Close
  function openSignInPanel() {
    form.style.display = "grid";
    signupForm.style.display = "none";
    accountBox.style.display = "none";
    pricingBox.style.display = "none";
    paymentBox.style.display = "none";
    h1.textContent = "SellerRadar Login";
    msg.textContent = "";
    signupMsg.textContent = "";
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
    host.style.pointerEvents = "auto";
  }

  function openSignUpPanel() {
    form.style.display = "none";
    signupForm.style.display = "grid";
    accountBox.style.display = "none";
    pricingBox.style.display = "none";
    paymentBox.style.display = "none";
    h1.textContent = "Create Account";
    msg.textContent = "";
    signupMsg.textContent = "";
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
    host.style.pointerEvents = "auto";
  }

  function closeSignInPanel() {
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    host.style.pointerEvents = "none";
  }

  // Open/Close
  function openInfoInPanel(email, full_name, plan_expire) {
    // Format date from YYYY-MM-DD to DD-MM-YYYY
    let formattedExpire = plan_expire;
    if (plan_expire && plan_expire !== "Lifetime" && plan_expire !== "No Plan") {
      const match = String(plan_expire).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        formattedExpire = `${match[3]}-${match[2]}-${match[1]}`;
      }
    }

    // Update button text based on plan status
    if (plan_expire === "No Plan" || !plan_expire) {
      viewPlansBtn.textContent = "Subscribe Now";
      viewPlansBtn.style.background = "#16a34a";
      planExpireLabel.style.color = "#f59e0b";
      planExpireLabel.textContent = "Status: No Active Plan";
    } else {
      // Check if plan is expired
      const today = new Date();
      const expireDate = new Date(plan_expire);
      if (expireDate < today) {
        viewPlansBtn.textContent = "Renew Plan";
        viewPlansBtn.style.background = "#dc2626";
        planExpireLabel.style.color = "#dc2626";
        planExpireLabel.textContent = "Status: Plan Expired (" + formattedExpire + ")";
      } else {
        viewPlansBtn.textContent = "View Plans";
        viewPlansBtn.style.background = "#2563eb";
        planExpireLabel.style.color = "#16a34a";
        planExpireLabel.textContent = "Valid until: " + formattedExpire;
      }
    }

    // Toggle visibility
    nameLabel.textContent = "Name: " + full_name;
    emailLabel.textContent = "Email: " + email;
    h1.textContent = "SellerRadar";
    form.style.display = "none";
    signupForm.style.display = "none";
    pricingBox.style.display = "none";
    paymentBox.style.display = "none";
    accountBox.style.display = "block";
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
    host.style.pointerEvents = "auto";
  }

  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeSignInPanel(); });
  closeBtn.addEventListener("click", closeSignInPanel);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Signing in…";
    btn.disabled = true;
    const username = (shadow.getElementById("email") || {}).value?.trim();
    const password = (shadow.getElementById("password") || {}).value || "";

    try {
      msg.style.color = "#6b7280";
      msg.textContent = "Signing in…";
      btn.disabled = true;

      if (!chrome?.runtime?.id) {
        msg.style.color = "#dc2626";
        msg.textContent = "Extension reloaded. Refresh the page.";
        btn.disabled = false;
        return;
      }

      chrome.runtime.sendMessage(
        { type: "auth_login", payload: { username, password } },
        async (resp) => {
          const lastErr = chrome.runtime.lastError;
          if (lastErr) {
            msg.style.color = "#dc2626";
            msg.textContent = `${lastErr.message}`;
            btn.disabled = false;
            return;
          }

          if (!resp || !resp.ok || resp?.data?.detail) {
            const errMsg = resp?.data?.detail || resp?.data?.message || resp?.error || `HTTP ${resp?.status || ""}`;
            msg.style.color = "#dc2626";
            msg.textContent = `${errMsg}`;
            btn.disabled = false;
            return;
          }

          // ✅ use resp.data (not resp.body)
          const token = resp.data?.access_token || null;
          if (!token) {
            msg.style.color = "#dc2626";
            msg.textContent = `no token returned`;
            btn.disabled = false;
            return;
          }

          try {
            // 🔑 ask background to set the cookie
            const setResp = await chrome.runtime.sendMessage({
              type: "set_cookie",
              url: "https://meesho.com/", // ← your API origin
              name: "auth_token_seller",
              value: token,
              days: 30
            });

            if (!setResp?.ok) {
              msg.style.color = "#dc2626";
              msg.textContent = `Login succeeded, cookie failed: ${setResp?.error || ""}`;
              btn.disabled = false;
              return;
            }

            const email = resp.data?.email || null;

            await chrome.runtime.sendMessage({
              type: "set_cookie",
              url: "https://meesho.com/", // ← your API origin
              name: "email_seller",
              value: email,
              days: 30
            });


            const full_name = resp.data?.full_name || null;

            await chrome.runtime.sendMessage({
              type: "set_cookie",
              url: "https://meesho.com/", // ← your API origin
              name: "full_name_seller",
              value: full_name,
              days: 30
            });


            const plan_expire_seller = resp.data?.plan_expired || null;

            await chrome.runtime.sendMessage({
              type: "set_cookie",
              url: "https://meesho.com/", // ← your API origin
              name: "plan_expire_seller",
              value: plan_expire_seller,
              days: 30
            });

            msg.style.color = "#16a34a";
            msg.textContent = "Signed in!";

            await handlePostLogin();

            closeSignInPanel();

          } catch (e) {
            console.error(e);
            msg.style.color = "#dc2626";
            msg.textContent = `Login succeeded but setup failed: ${String(e)}`;
          } finally {
            btn.disabled = false;
          }
        }
      );

    } catch (err) {
      msg.style.color = "#dc2626";
      msg.textContent = `Login failed: ${err.message || err}`;
    } finally {
      btn.disabled = false;
    }

  });

  // Sign-up form submit handler
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = (shadow.getElementById("signup_fullname") || {}).value?.trim() || "";
    const signupEmail = (shadow.getElementById("signup_email") || {}).value?.trim() || "";
    const mobile = (shadow.getElementById("signup_mobile") || {}).value?.trim() || "";
    const signupPass = (shadow.getElementById("signup_password") || {}).value || "";
    const confirmPass = (shadow.getElementById("signup_confirm_password") || {}).value || "";

    // Validation
    if (!fullName || !signupEmail || !mobile || !signupPass) {
      signupMsg.style.color = "#dc2626";
      signupMsg.textContent = "Please fill in all fields.";
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      signupMsg.style.color = "#dc2626";
      signupMsg.textContent = "Mobile number must be exactly 10 digits.";
      return;
    }

    if (signupPass.length < 6) {
      signupMsg.style.color = "#dc2626";
      signupMsg.textContent = "Password must be at least 6 characters.";
      return;
    }

    if (signupPass !== confirmPass) {
      signupMsg.style.color = "#dc2626";
      signupMsg.textContent = "Passwords do not match.";
      return;
    }

    signupMsg.style.color = "#6b7280";
    signupMsg.textContent = "Creating account…";
    signupBtn.disabled = true;

    if (!chrome?.runtime?.id) {
      signupMsg.style.color = "#dc2626";
      signupMsg.textContent = "Extension reloaded. Refresh the page.";
      signupBtn.disabled = false;
      return;
    }

    chrome.runtime.sendMessage(
      {
        type: "auth_signup",
        payload: {
          full_name: fullName,
          email: signupEmail,
          password: signupPass,
          mobile_number: mobile
        }
      },
      async (resp) => {
        const lastErr = chrome.runtime.lastError;
        if (lastErr) {
          signupMsg.style.color = "#dc2626";
          signupMsg.textContent = `${lastErr.message}`;
          signupBtn.disabled = false;
          return;
        }

        if (!resp || !resp.ok || resp?.data?.detail) {
          const errMsg = resp?.data?.detail || resp?.data?.message || resp?.error || "Registration failed";
          signupMsg.style.color = "#dc2626";
          signupMsg.textContent = `${errMsg}`;
          signupBtn.disabled = false;
          return;
        }

        // Success - auto-login
        const token = resp.data?.access_token || null;
        if (!token) {
          signupMsg.style.color = "#dc2626";
          signupMsg.textContent = "Account created but no token returned. Please login.";
          signupBtn.disabled = false;
          // Switch to login form
          signupForm.style.display = "none";
          form.style.display = "grid";
          h1.textContent = "SellerRadar Login";
          return;
        }

        try {
          // Set auth cookie
          await chrome.runtime.sendMessage({
            type: "set_cookie",
            url: "https://meesho.com/",
            name: "auth_token_seller",
            value: token,
            days: 30
          });

          // Set email cookie
          await chrome.runtime.sendMessage({
            type: "set_cookie",
            url: "https://meesho.com/",
            name: "email_seller",
            value: resp.data?.email || "",
            days: 30
          });

          // Set full_name cookie
          await chrome.runtime.sendMessage({
            type: "set_cookie",
            url: "https://meesho.com/",
            name: "full_name_seller",
            value: resp.data?.full_name || "",
            days: 30
          });

          // Set plan_expire cookie
          await chrome.runtime.sendMessage({
            type: "set_cookie",
            url: "https://meesho.com/",
            name: "plan_expire_seller",
            value: resp.data?.plan_expired || "",
            days: 30
          });

          signupMsg.style.color = "#16a34a";
          signupMsg.textContent = "Account created! Redirecting to plans...";

          // Clear form fields
          fullNameInput.value = "";
          signupEmailInput.value = "";
          mobileInput.value = "";
          signupPassInput.value = "";
          confirmPassInput.value = "";

          await handlePostLogin();

          // Show pricing panel for new users
          openPricingPanel();

        } catch (e) {
          console.error(e);
          signupMsg.style.color = "#dc2626";
          signupMsg.textContent = `Account created but setup failed: ${String(e)}`;
        } finally {
          signupBtn.disabled = false;
        }
      }
    );
  });

  window.openSignInPanel = openSignInPanel;
  window.openSignUpPanel = openSignUpPanel;
  window.openInfoInPanel = openInfoInPanel;
  window.openPricingPanel = openPricingPanel;
  window.closeSignInPanel = closeSignInPanel;

})();

async function handlePostLogin() {
  loadExtScript("product-list");
  if (window.location.href.includes('/p/')) {
    loadExtScript("product-details");
  }
}

(function () {
  // Patch SPA history to detect in-page route changes
  const fire = () => {
    chrome.runtime.sendMessage({ type: "URL_CHANGED", url: location.href }, () => void 0);
  };

  ["pushState", "replaceState"].forEach(m => {
    const orig = history[m];
    history[m] = function () {
      const ret = orig.apply(this, arguments);
      fire();
      return ret;
    };
  });
  window.addEventListener("popstate", fire);

  fire();
  var lastSent = null;
  function getProductIdFromOg() {
    const el = document.querySelector('meta[property="og:image"]');
    if (!el?.content) return null;
    try {
      const { pathname } = new URL(el.content);
      const parts = pathname.split('/');
      const i = parts.indexOf('products');
      return i >= 0 ? parts[i + 1] : null;
    } catch {
      return null;
    }
  }

  function loadExtScript(filePath) {
    floatingButton();
    setTimeout(() => {
      if (filePath.includes('product-list')) {
        productList();
      }
      if (filePath.includes('product-details')) {
        const id = getProductIdFromOg();
        if (id && id !== lastSent) {
          lastSent = id;
          chrome.runtime.sendMessage(
            { type: "MEESHO_SEARCH", query: id },
            resp => {
              if (resp && resp.ok) {
                const data = (resp.data.data || {});
                if (data) {
                  const urlObj = new URL(window.location.href);
                  const segments = urlObj.pathname.split("/").filter(Boolean);
                  const productCode = segments.pop();
                  if (String(data.encrypted_product_id) == String(productCode)) {
                    productDetails(data);
                  }
                }
              }
            }
          );
        }
      }
    }, 1000);
  }

  window.loadExtScript = loadExtScript;
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "SPA_URL") {
      loadExtScript("product-list");
      if (window.location.href.includes('/p/')) {
        loadExtScript("product-details");
      }
    }
  });

  const obs = new MutationObserver(() => { });
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();

async function checkAuth() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "auth_status" }, (resp) => {
      if (chrome.runtime.lastError) {
        console.error("auth_status error:", chrome.runtime.lastError.message);
        resolve({ loggedIn: false, token: null, email: null, full_name: null, plan_expire: null });
        return;
      }
      resolve(resp || { loggedIn: false, token: null, email: null, full_name: null, plan_expire: null });
    });
  });
}

async function onLogout() {
  chrome.runtime.sendMessage({ type: "logout" }, (resp) => {
    if (!resp?.ok) {
      alert(`Logout failed: ${resp?.error || ""}`);
      return;
    }
    openSignInPanel();
  });
}

function floatingButton() {
  if (document.getElementById("SellerRadar")) return;

  const fab = document.createElement("button");
  fab.id = "SellerRadar";
  fab.setAttribute("data-tooltip", "Seller Radar");

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("/img/icon256.png");

  Object.assign(img.style, {
    width: "70%",
    height: "70%",
    borderRadius: "50%",
    objectFit: "cover",
    pointerEvents: "none"
  });
  fab.appendChild(img);

  Object.assign(fab.style, {
    position: "fixed",
    right: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    border: "none",
    background: "#ffffff",
    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
    cursor: "pointer",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0"
  });



  fab.addEventListener("click", async () => {
    const { loggedIn, token, email, full_name, plan_expire } = await checkAuth();
    if (!loggedIn) { window.openSignUpPanel(); } else { window.openInfoInPanel(email, full_name, plan_expire); }
  });

  document.body.appendChild(fab);
  (async () => {
    // 1. Refresh data from backend first!
    await chrome.runtime.sendMessage({ type: "refresh_user" });

    const { loggedIn, plan_expire } = await checkAuth();
    if (!loggedIn) {
      window.openSignUpPanel();
    } else {
      // Check for plan expiration
      const today = new Date();
      // Handle "No Plan" or null as expired
      if (!plan_expire || plan_expire === "No Plan" || (plan_expire !== "Lifetime" && new Date(plan_expire) < today)) {
        // Force open pricing panel
        openPricingPanel();
      }
    }
  })();
}

function productList() {
  const L = (function () {
    const prefix = "[SR]";
    const api = {
      info: (...a) => console.log(prefix, ...a),
      debug: (...a) => console.log(prefix, ...a),
      warn: (...a) => console.warn(prefix, ...a),
      error: (...a) => console.error(prefix, ...a),
    };
    try { return (window.SR_LOG && typeof window.SR_LOG.info === "function") ? window.SR_LOG : api; }
    catch { return api; }
  })();


  // --------- selectors / constants ---------
  const PRODUCTS_SELECTOR = '.products';
  const CARD_SELECTOR = '[class*="NewProductCardstyled__CardStyled"]';
  const PRICE_ROW_SELECTOR = CARD_SELECTOR; // we treat the whole card as the row
  const INFO_CLASS = 'my-custom-div';

  // caching & fetch control
  const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
  const BATCH_SIZE = 20;             // request up to 10 pids per call
  const COOLDOWN_MS = 60 * 1000;      // 60s cooldown for misses/failures

  /** pid -> { data, t, sig } */
  const cache = new Map();
  /** pids currently being fetched */
  const inflight = new Set();
  /** pid -> timestamp (ms) until which we skip refetch */
  const missUntil = new Map();

  const now = () => Date.now();
  const isStale = (e) => !e || (now() - e.t) > CACHE_TTL_MS;

  const sendRuntimeMessage = (payload) => new Promise(res => {
    try { chrome.runtime.sendMessage(payload, (resp) => res(resp)); }
    catch (err) { }
  });

  // only include fields that are actually displayed (prevents unnecessary rerenders)
  const buildSignature = (info) => {
    const pick = v => v == null ? '' : String(v);
    return [
      pick(info.category_name),
      pick(info.listing_price),
      pick(info.shipping_charge),
      pick(info.catalog_activated),
      pick(info.quality),
      pick(info.orders_per_day),
    ].join('|');
  };

  // ---------- DOM helpers ----------
  function getProductIdFromRow(row) {
    try {
      const imageRow = row.querySelector('[class*="NewProductCardstyled__ProductImage"]');
      const imgUrl = imageRow?.querySelector("picture img")?.getAttribute("src");
      const match = imgUrl?.match(/products\/(\d+)\//);
      const pid = match ? match[1] : null;

      return pid;
    } catch (e) {
      return null;
    }
  }

  function findCardContainer(row) {
    return row.closest(CARD_SELECTOR) || row;
  }

  // we append inside the card and then pin to its bottom
  function insertionPoint(priceRow) {
    return findCardContainer(priceRow); // the card element
  }

  // ---------- pinned bottom utilities ----------
  function pinInsideCardBottom(card, box) {
    const cs = getComputedStyle(card);

    // make card positioned
    if (cs.position === 'static' || !cs.position) {
      card.dataset.srPosWasStatic = '1';
      card.style.position = 'relative';
    }

    // we’ll pin **flush** to the inner edge of the card (ignore its padding)
    const INSET_X = 0;   // 0 = no left/right space
    const INSET_Y = 0;   // 0 = no bottom space

    Object.assign(box.style, {
      position: 'absolute',
      left: INSET_X + 'px',
      right: INSET_X + 'px',
      bottom: INSET_Y + 'px',
      margin: '0',
    });

    // Reserve exactly the panel height (no extra breathing room)
    requestAnimationFrame(() => {
      const pb = parseFloat(cs.paddingBottom || '0');
      const h = box.offsetHeight;
      const need = h + INSET_Y;                 // no extra
      const want = Math.max(pb, need);
      if (!card.dataset.srPbOrig) card.dataset.srPbOrig = String(pb);
      card.style.paddingBottom = want + 'px';
    });
  }

  function toRoundedInt(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null; // or return 0 / "" based on your needs
    return Math.round(n);
  }

  function unpinFromCard(card) {
    if (!card) return;
    if (card.dataset.srPbOrig != null) {
      card.style.paddingBottom = `${card.dataset.srPbOrig}px`;
      delete card.dataset.srPbOrig;
    }
    if (card.dataset.srPosWasStatic === '1') {
      card.style.position = '';
      delete card.dataset.srPosWasStatic;
    }
  }

  function toDDMMYYYY(input) {
    if (input == "") {
      return input;
    }

    const m = String(input).match(
      /^(\d{4})-(\d{2})-(\d{2})(?:\s+\d{2}:\d{2}:\d{2})?$/
    );
    if (!m) return ""; // or throw new Error("Invalid date format")
    const [, y, mo, d] = m;
    return `${d}-${mo}-${y}`;
  }


  // ---------- info box (fixed height, no wrap, ellipsis) ----------
  function buildInfoBox(data) {
    const FIXED_H = 140;
    const box = document.createElement("div");
    box.className = INFO_CLASS;

    Object.assign(box.style, {
      padding: "8px 10px",
      background: "rgb(248, 248, 255)",
      color: "#111",
      border: "1px solid #ececf5",
      borderRadius: "8px",
      width: "100%",
      boxSizing: "border-box",
      lineHeight: "1.3",
      fontSize: "13px",
      height: FIXED_H + "px",
      overflow: "hidden",
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      columnGap: "10px",
      rowGap: "6px",
      alignItems: "start",
      position: "relative"   // <<— required for absolute logo
    });

    // → Add Logo (top-right corner)
    const logo = document.createElement("img");
    logo.id = "Oneclickoms-logo-img";
    logo.alt = "OneClickOMS Logo";
    Object.assign(logo.style, {
      position: "absolute",
      right: "0px",
      width: "32px",
      height: "32px",
      borderRadius: "25%",
      boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
      background: "#fff",
      cursor: "pointer"
    });

    // Load extension image correctly
    logo.src = chrome.runtime.getURL("/img/icon256.png");

    box.appendChild(logo);

    const cellCSS = "white-space:nowrap; overflow:hidden; text-overflow:ellipsis;";
    const cat = data.category_name ?? "";
    const list = `₹${toRoundedInt(data.listing_price ?? 0)}`;
    const ship = `₹${toRoundedInt(data.shipping_charge ?? 0)}`;
    const created = toDDMMYYYY(data.catalog_activated ?? "");
    const state_name = data.state_name ?? "";
    const qual = data.quality_score;
    const orderperday = data.daily_order ?? "0 - 0 / day";

    box.innerHTML += `
    <div style="color:#6b7280; ${cellCSS}">Category:</div>   <div style="font-weight:600; ${cellCSS}" title="${cat}">${cat}</div>
    <div style="color:#6b7280; ${cellCSS}">Listing:</div>    <div style="font-weight:700; ${cellCSS}" title="${list}">${list}</div>
    <div style="color:#6b7280; ${cellCSS}">Shipping:</div>   <div style="font-weight:700; ${cellCSS}" title="${ship}">${ship}</div>
    <div style="color:#6b7280; ${cellCSS}">Created:</div>    <div style="font-weight:700; ${cellCSS}" title="${created}">${created}</div>
    <div style="color:#6b7280; ${cellCSS}">State:</div>      <div style="font-weight:700; ${cellCSS}" title="${state_name}">${state_name}</div>
    <div style="color:#6b7280; ${cellCSS}">Quality:</div>    <div style="font-weight:600; ${cellCSS}" title="${qual}">${qual} %</div>
    <div style="color:#6b7280; ${cellCSS}">Orders/Day*:</div><div style="font-weight:700; ${cellCSS}" title="${orderperday}">${orderperday}</div>
  `;

    return box;
  }


  // ---------- upsert/remove ----------
  function upsertInfoBoxForRow(priceRow, pid, info) {
    const sig = buildSignature(info);
    const card = insertionPoint(priceRow);

    let existing = card.querySelector(`.${INFO_CLASS}[data-sr-pid="${pid}"]`);
    if (existing && existing.dataset.srSig === sig) {
      return;
    }
    if (existing) existing.remove();

    const box = buildInfoBox(info);
    box.dataset.srPid = pid;
    box.dataset.srSig = sig;

    card.appendChild(box);
    pinInsideCardBottom(card, box);

  }

  function removeInfoBoxForRow(priceRow, pid) {
    const card = insertionPoint(priceRow);
    const existing = card.querySelector(`.${INFO_CLASS}[data-sr-pid="${pid}"]`);
    if (existing) {
      existing.remove();
      const still = card.querySelector(`.${INFO_CLASS}[data-sr-pid]`);
      if (!still) unpinFromCard(card);
    }
  }

  // ---------- main cycle ----------
  async function ensureInfoBoxes(root = document) {
    const t0 = performance.now();

    const products = root.querySelector(PRODUCTS_SELECTOR);
    if (!products) { ; return; }

    const rows = products.querySelectorAll(PRICE_ROW_SELECTOR);
    if (!rows.length) { return; }

    const pidToRow = new Map();
    rows.forEach(row => {
      const pid = getProductIdFromRow(row);
      if (pid) { pidToRow.set(pid, row); row.dataset.srPid = pid; }
    });

    const pids = [...pidToRow.keys()];

    // compute which pids to fetch (respect cooldown)
    const needFetch = [];
    for (const pid of pids) {
      const entry = cache.get(pid);
      const until = missUntil.get(pid) || 0;
      if (now() < until) continue;
      if (isStale(entry)) needFetch.push(pid);
    }

    // render from cache first
    for (const [pid, row] of pidToRow.entries()) {
      const entry = cache.get(pid);
      if (entry && !isStale(entry)) upsertInfoBoxForRow(row, pid, entry.data);
    }

    // filter inflight/cooldown and batch fetch
    const ready = needFetch.filter(pid => !inflight.has(pid) && (now() >= (missUntil.get(pid) || 0)));
    if (ready.length) {
      ready.forEach(pid => inflight.add(pid));

      for (let i = 0; i < ready.length; i += BATCH_SIZE) {
        const chunk = ready.slice(i, i + BATCH_SIZE);
        try {
          const resp = await sendRuntimeMessage({ type: "MEESHO_LIST", query: chunk.join(",") });

          if (!resp || !resp.ok) {
            const until = now() + COOLDOWN_MS;
            chunk.forEach(pid => missUntil.set(pid, until));

            // Check for plan expired error
            const errorType = resp?.data?.error;
            const errorDetail = resp?.data?.detail;
            if (errorType === "plan_expired") {
              // alert(errorDetail || "Your plan has expired. Please renew to continue.");
              openPricingPanel();
            }
          } else {
            // Check if error is in successful response
            if (resp.data?.error === "plan_expired") {
              // alert(resp.data.detail || "Your plan has expired. Please renew to continue.");
              openPricingPanel();
              return;
            }

            const payload = resp.data?.data;
            const dataMap =
              payload && !Array.isArray(payload)
                ? payload
                : Array.isArray(payload)
                  ? Object.fromEntries(payload.map(item => [String(item.product_id), item]))
                  : {};

            for (const pid of chunk) {
              const info = dataMap[String(pid)];
              const row = pidToRow.get(pid);

              if (info) {
                cache.set(pid, { data: info, t: now(), sig: buildSignature(info) });
                if (row) upsertInfoBoxForRow(row, pid, info);
              } else {
                missUntil.set(pid, now() + COOLDOWN_MS);
                if (row) removeInfoBoxForRow(row, pid);
              }
            }
          }
        } catch (err) {
          const until = now() + COOLDOWN_MS;
          chunk.forEach(pid => missUntil.set(pid, until));
        } finally {
          chunk.forEach(pid => inflight.delete(pid));
        }
      }
    }

    // cleanup orphans
    const live = new Set(pids);
    document.querySelectorAll(`.${INFO_CLASS}[data-sr-pid]`).forEach(box => {
      const pid = box.dataset.srPid;
      if (pid && !live.has(pid)) {
        const card = box.closest(CARD_SELECTOR);
        box.remove();
        if (card && !card.querySelector(`.${INFO_CLASS}[data-sr-pid]`)) unpinFromCard(card);
      }
    });

    const ms = (performance.now() - t0).toFixed(1);
  }

  let rafId = null;
  function scheduleEnsure() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => { rafId = null; ensureInfoBoxes(); });
  }

  let observer = null;
  function startObserving(productsRoot) {
    if (observer) observer.disconnect();
    observer = new MutationObserver((muts) => {
      scheduleEnsure();
    });
    observer.observe(productsRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset']
    });
    ensureInfoBoxes();
  }

  // ---------- attach to DOM ----------
  function tryAttach() {
    const productsRoot = document.querySelector(PRODUCTS_SELECTOR);
    if (productsRoot) {
      clearInterval(waitId);
      startObserving(productsRoot);
    } else {
    }
  }

  const waitId = setInterval(tryAttach, 800);
  tryAttach();

  // optional: react to SPA messages (keep cache for offline-first)
  try {
    chrome.runtime?.onMessage?.addListener?.((msg) => {
      if (msg?.type === "SPA_URL") {
        scheduleEnsure();
      }
    });
  } catch (e) {
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatDateLabel(dateStr) {
  const date = new Date(dateStr);
  const options = { month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options); // e.g. "Aug 15"
}

function productDetails(resp) {
  if (!resp || !resp.product_id) return;

  const reviews = resp.reviews;

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => {
    counts[r.review_rating] = (counts[r.review_rating] || 0) + 1;
  });

  const total = reviews.length;

  const avg = total === 0 ? 0 : (reviews.reduce((sum, r) => sum + r.review_rating, 0) / total).toFixed(1);

  const negative_review = (counts[1] ?? 0) + (counts[2] ?? 0);

  const report = {
    total,
    negative_review,
    avg: parseFloat(avg),
    ratings: {}
  };

  const qualityScore = report.total > 0
    ? ((report.negative_review ?? 0) / report.total * 100).toFixed(2)
    : "0.00";

  for (let star = 5; star >= 1; star--) {
    const count = counts[star] || 0;
    report.ratings[star] = {
      count,
      percentage: total === 0 ? "0%" : Math.round((count / total) * 100) + "%"
    };
  }

  let chipsContainerInnerHTML = "";
  Object.entries(report.ratings).forEach(([star, data]) => {
    const chip = `
      <div class="chip c${star}">
        <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
          <b>${star}★</b>
          <span>${data.count}</span>
          <span style="color:#6b7280;">(${data.percentage})</span>
        </div>
      </div>`;
    chipsContainerInnerHTML += chip;
  });

  const mall_verified = resp.mall_verified || false; // <-- replace with backend value

  mallStatusDivInnerHTML = ''

  if (mall_verified) {
    mallStatusDivInnerHTML = `
      🏬 Meesho Mall: <b><span style="color:#16a34a; font-weight:700;">✔</span></b>
    `;
  } else {
    mallStatusDivInnerHTML = `
      🏬 Meesho Mall: <b><span style="color:#b91c1c; font-weight:700;">✖</span></b>
    `;
  }

  affiliateCommissionTextInnerHTML = ''
  if (resp.affiliate_commission_text && resp.affiliate_commission_text != '') {
    affiliateCommissionTextInnerHTML = `
      🤝 Affiliate: <b><span style="color:#16a34a; font-weight:700;"></span></b> 
      <b><span style="color:#000;">${resp.affiliate_commission_text}</span></b>
    `;
  } else {
    affiliateCommissionTextInnerHTML = `
      🤝 Affiliate: <b><span style="color:#b91c1c; font-weight:700;">✖</span></b>
    `;
  }

  let reviewsTrackInnerHTML = "";
  reviews.forEach(r => {
    const card = `
      <div class="card" style="min-width:250px; max-width:300px; height:160px; flex:0 0 auto; padding:10px; box-sizing:border-box; border:1px solid #e5e7eb; border-radius:8px;">

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong>${r.review_author}</strong>
          <small style="color:#6b7280;">${formatDate(r.review_date)}</small>
        </div>

        <div style="color:#f59e0b; margin:2px 0;">
          ${"★".repeat(r.review_rating)}${"☆".repeat(5 - r.review_rating)}
        </div>

        <div style="
            color:#374151;
            display:-webkit-box;
            -webkit-line-clamp:3;
            -webkit-box-orient:vertical;
            overflow:hidden;
            text-overflow:ellipsis;
            line-height:1.4;
            max-height:4.2em;
          ">
          ${r.review_comment}
        </div>
      </div>`;
    reviewsTrackInnerHTML += card;
  });

  const container = document.createElement("div");
  container.style.cssText = `
  	margin-bottom: 16px;
    width: 100%;
    border: 1px solid rgb(234, 234, 242);
    border-radius: 12px;
    font-family: "Mier bold";
  `;

  container.innerHTML = `
  <style>
    /* Scoped to this container only */
    #mm-wrap { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111; }
    #mm-wrap .section {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;   /* <<< partition line */
    }
    #mm-wrap .section:last-of-type { border-bottom: 0; } /* no line after last */
    #mm-wrap .grid-two {
      display:grid; grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px 16px;
    }
    #mm-wrap .chips {
      display:flex; flex-wrap:nowrap; gap:10px; overflow-x:auto; -ms-overflow-style:none; scrollbar-width:none;
    }
    #mm-wrap .chips::-webkit-scrollbar { display:none; }
    #mm-wrap .chip {
		flex:1 1 0;
		min-width:70px;
		height:80px;                /* fixed equal height */
		display:flex; ̰
		align-items:center;
		justify-content:center;
		border-radius:10px;
		border:1px solid transparent;
		}
  
  .grid-two > div{
    color: rgb(139, 139, 163);
  }
 
  .grid-two > div b {
    color: #000; 
    font-weight:500;
  }

  .icon-btn{
    width:34px; height:34px; border-radius:999px;
    border:1px solid #e5e7eb; background:#f3f4f6;
    display:inline-flex; align-items:center; justify-content:center;
    font-size:14px; cursor:pointer; line-height:1; user-select:none;
    transition:transform .05s ease, background .15s ease;
  }
  .icon-btn:hover{ background:#e5e7eb; }
  .icon-btn:active{ transform:scale(0.98); }

	#mm-wrap .chip > div {
		display:flex;
		flex-direction:column;
		align-items:center;
		justify-content:center;
		line-height:1.3;
	}
    #mm-wrap .chip.c5 { background:#e8f7e8; border-color:#e5efe5; }
    #mm-wrap .chip.c4 { background:#eff9ef; border-color:#e5efe5; }
    #mm-wrap .chip.c3 { background:#fff3d9; border-color:#f4e9c6; }
    #mm-wrap .chip.c2, #mm-wrap .chip.c1 { background:#ffe6e6; border-color:#f6d3d3; }

    #mm-wrap .reviews-head { display:flex; align-items:center; justify-content:space-between; gap:12px; }
    #mm-wrap .cards-track {
      display:flex; gap:12px; overflow-x:auto; scroll-behavior:smooth; padding:2px 0 4px;
      -ms-overflow-style:none; scrollbar-width:none;
    }
    #mm-wrap .cards-track::-webkit-scrollbar { display:none; }
    #mm-wrap .card {
      flex:0 0 300px; background:#fff;
      border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.06);
      padding:12px;
    }
    #mm-wrap .arrow {
      width:34px; height:34px; border:none; border-radius:50%;
      background:#f3f4f6; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,.08);
    }
  </style>

  <div id="mm-wrap">
    <!-- SECTION 1: Props / Metrics -->
	<!-- <div class="section" style="color:#d32f2f;font-weight:bold;margin-bottom:8px;">
	 ⚠️ Possible Review Manipulation Detected
	 </div>-->
    <div class="section">
      <div class="grid-two">
        <div>📈 Orders/Day*: <b>${resp.daily_order}</b></div>
        <div>📈 Lifetime Orders*: <b>${resp.lifetime_order}</b></div>

        <div>📈 Quality Score: <b>${resp.quality_score}%</b></div>
        <div>📅 Created Date: <b>${resp.catalog_activated}</b></div>

        <div style="overflow:hidden; text-overflow:ellipsis;">
          🏷️ Category:
          <span style="white-space:normal; word-wrap:break-word;">
            <b>${resp.category_name}</b>
          </span>
        </div>

        <div>📍 Supplier State: <b>${resp.state_code}</b></div>

        <div>🆔 Product ID: <b>${resp.product_id}</b></div>
        <div>🗂️ Catalog ID: <b>${resp.catalog_id}</b></div>

        <div>${mallStatusDivInnerHTML}</div>
        <div>${affiliateCommissionTextInnerHTML}</div>
      </div>
    </div>

    <!-- SECTION 2: Reviews header + 5 chips (single line) -->
    <div class="section">
      <div class="reviews-head" style="margin-top:10px; margin-bottom:20px;">
       <h3 style="margin:0; font-size:18px;">
        📊 <span style="font-weight:700;">Customer Reviews</span>
        <span style="font-size:12px; color:#6b7280; font-weight:500;">(Last 30 days)</span>
      </h3>
      <div style="display:flex; align-items:center; gap:8px;">
        <span id="avg-rating" style="font-weight:700; font-size:16px;">${report.avg}</span>
        <span id="stars" aria-hidden="true" style="color:#f59e0b; letter-spacing:1px;">${("★★★★★".slice(0, Math.round(report.avg)) + "☆☆☆☆☆".slice(Math.round(report.avg)))}</span>
        <span id="total-reviews" style="color:#6b7280; font-size:13px;">${report.total} reviews</span>
      </div>
      </div>
      <div class="chips" id="chips-container">${chipsContainerInnerHTML}</div>
    </div>

    <!-- SECTION 3: Recent Reviews + cards -->
    <div class="section">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <h4 style="margin:0; font-size:16px;">Recent Reviews</h4>

        <div style="display:flex; gap:8px; align-items:center;">
          <!-- Export icon button -->
          <button id="btn-export" type="button" aria-label="Export CSV"
            class="icon-btn" title="Export CSV">⬇︎</button>

          <button id="btn-left"  type="button" class="icon-btn" aria-label="Scroll left">←</button>
          <button id="btn-right" type="button" class="icon-btn" aria-label="Scroll right">→</button>
        </div>
      </div>

      <div id="reviews-track" class="cards-track">
		      ${reviewsTrackInnerHTML}
      </div>
    </div>
    <div class="section">
    </div
  </div>
`;

  function buildCsvFromReviews(reviews) {
    const headers = ["Review Date", "Review Rating", "Review Author", "Review Comment"];
    const esc = v => {
      v = v == null ? "" : String(v);
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    };
    const lines = [headers.join(",")];
    for (const r of reviews) {
      lines.push([
        formatDate(esc(r.review_date)),
        esc(r.review_rating),
        esc(r.review_author),
        esc(r.review_comment)
      ].join(","));
    }
    return lines.join("\n");
  }

  function exportReviewsToCSV() {
    const rows = reviews || [];
    if (!rows.length) {
      alert("No reviews to export");
      return;
    }

    const csv = buildCsvFromReviews(rows);
    chrome.runtime.sendMessage({
      action: "download",
      csv: csv,                                    // send CSV text
      filename: `${resp.product_id}_reviews_${new Date().toISOString().slice(0, 10)}.csv`
    });
  }

  // arrows behavior
  (() => {
    const track = container.querySelector('#reviews-track');
    const left = container.querySelector('#btn-left');
    const right = container.querySelector('#btn-right');
    const step = 320;
    if (track && left && right) {
      left.addEventListener('click', () => (track.scrollLeft -= step));
      right.addEventListener('click', () => (track.scrollLeft += step));
      track.addEventListener('wheel', e => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          track.scrollLeft += e.deltaY; e.preventDefault();
        }
      }, { passive: false });
    }

    const btn_export = container.querySelector('#btn-export');
    btn_export.addEventListener('click', () => exportReviewsToCSV());

  })();

  const targetNode = document.querySelector('div[class*="ProductDescription"]');
  // 3. Insert before the target
  if (targetNode && targetNode.parentNode) {
    targetNode.parentNode.insertBefore(container, targetNode);
  }
  // Append the chart section inside the "Recent Reviews" section
  (function appendNativeChart() {
    const mm = container.querySelector('#mm-wrap');
    const recentSec = mm?.querySelectorAll('.section')[3];
    if (!recentSec) return;

    recentSec.insertAdjacentHTML('beforeend', `
    <div style="margin-top:14px; border-top:1px dashed #eee; padding-top:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <h4 style="margin:0; font-size:16px;">Review Analytics</h4>
      </div>
      <div id="native-chart-wrap" style="position:relative; height:280px;">
        <canvas id="native-reviews-chart" width="640" height="280" style="width:100%; height:280px;"></canvas>
        <div id="native-tooltip" style="
          position:absolute; pointer-events:none; background:rgba(0,0,0,.85); color:#fff;
          font-size:12px; padding:8px 10px; border-radius:8px; display:none; max-width:220px;
          transform:translate(-50%, -100%); white-space:pre-line;
        "></div>
      </div>
    </div>
  `);

    // ---------------------------
    // GROUP BY DATE
    // ---------------------------
    function groupReviewsByDate(reviews) {
      const grouped = {};

      reviews.forEach(r => {
        const label = formatDateLabel(r.review_date); // "Nov 11"

        if (!grouped[label]) {
          grouped[label] = { label, total: 0, s5: 0, s4: 0, s3: 0, s2: 0, s1: 0 };
        }

        grouped[label].total += 1;
        grouped[label][`s${r.review_rating}`] += 1;
      });

      return Object.values(grouped);
    }

    // ---------------------------
    // SORT REVIEWS CHRONOLOGICALLY
    // ---------------------------
    const reviewsSort = reviews.sort((a, b) => {
      return new Date(a.review_date) - new Date(b.review_date);
    });

    const data = groupReviewsByDate(reviewsSort);

    // ---------------------------
    // DRAW CHART
    // ---------------------------
    const canvas = document.getElementById('native-reviews-chart');
    const tip = document.getElementById('native-tooltip');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Handle Retina scaling
    (function scaleCanvas() {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;

      if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    })();

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    const pad = { top: 20, right: 16, bottom: 40, left: 36 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const maxY = Math.max(2, ...data.map(d => d.total));
    const yStep = Math.max(1, Math.ceil(maxY / 4));
    const finalMax = yStep * Math.ceil(maxY / yStep);

    const bars = [];
    const barWidth = (plotW / data.length) * 0.6;
    const xStep = (plotW / data.length);

    function yScale(v) {
      return pad.top + plotH - (v / finalMax) * plotH;
    }

    ctx.clearRect(0, 0, W, H);

    // ---------------------------
    // GRID + Y AXIS
    // ---------------------------
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let y = 0; y <= finalMax; y += yStep) {
      const yPix = yScale(y);
      ctx.beginPath();
      ctx.moveTo(pad.left, yPix);
      ctx.lineTo(W - pad.right, yPix);
      ctx.stroke();
      ctx.fillText(String(y), pad.left - 6, yPix);
    }

    // ---------------------------
    // X LABELS (HIDE EVEN INDEXES)
    // ---------------------------
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#6b7280';

    data.forEach((d, i) => {
      if (i % 2 === 1) return;  // ← HIDE EVEN LABELS

      const cx = pad.left + i * xStep + xStep / 2;
      ctx.save();
      ctx.translate(cx - 14, H - pad.bottom + 10);
      ctx.rotate(-Math.PI / 8);
      ctx.fillText(d.label, 0, 0);
      ctx.restore();
    });

    // ---------------------------
    // BARS
    // ---------------------------
    data.forEach((d, i) => {
      const cx = pad.left + i * xStep + xStep / 2;
      const x = cx - barWidth / 2;
      const y = yScale(d.total);
      const h = pad.top + plotH - y;

      ctx.fillStyle = 'rgba(59,130,246,0.45)';
      ctx.fillRect(x, y, barWidth, h);

      bars.push({ x, y, w: barWidth, h, i });
    });

    // ---------------------------
    // TOOLTIP
    // ---------------------------
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      let hovered = null;
      for (const b of bars) {
        if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
          hovered = b;
          break;
        }
      }

      if (!hovered) {
        tip.style.display = 'none';
        return;
      }

      const d = data[hovered.i];
      tip.innerText =
        `${d.label}\n` +
        `Daily Reviews: ${d.total}\n` +
        `5★: ${d.s5}\n4★: ${d.s4}\n3★: ${d.s3}\n2★: ${d.s2}\n1★: ${d.s1}`;

      tip.style.left = `${px}px`;
      tip.style.top = `${py - 8}px`;
      tip.style.display = 'block';
    });

    canvas.addEventListener('mouseleave', () => {
      tip.style.display = 'none';
    });
  })();

  // Select by base class only
  const priceRow = document.querySelector('div[class*="ShippingInfo__PriceRow"]');
  if (priceRow) {
    // Create wrapper for extra info on the right
    const extra = document.createElement('div');
    extra.style.marginLeft = "auto";   // push to right side
    extra.style.display = "flex";
    extra.style.gap = "12px";
    extra.style.alignItems = "center";


    // Shipping block
    const shipping = document.createElement('div');
    shipping.style.textAlign = "right";
    shipping.style.marginRight = "16px";   //
    shipping.innerHTML = `
    <div style="font-size:14px; color:#555; margin-bottom:2px;">
      🚚 <b>Shipping</b>
    </div>
    <div style="font-size:32px; font-weight:bold; color:#111;">
      ₹${(parseInt(resp.shipping_charge) || 0)}
    </div>
  `;

    // Listing block
    const listing = document.createElement('div');
    listing.style.textAlign = "right";
    listing.innerHTML = `
    <div style="font-size:14px; color:#555; margin-bottom:2px;">
      💰 <b>Listing</b>
    </div>
    <div style="font-size:32px; font-weight:bold; color:#111;">
      ₹${(parseInt(resp.listing_price) || 0)}
    </div>
  `;


    // Append
    extra.appendChild(shipping);
    extra.appendChild(listing);

    priceRow.appendChild(extra);
  }

  // ---- config/selectors ----
  const carousel = document.querySelector('[class*="ProductCard__StyledCarousel"]');
  if (carousel) {
    // ---------- helpers ----------
    function toBaseJpg(urlStr) {
      try {
        const u = new URL(urlStr, location.href);
        const newPath = u.pathname.replace(
          /\/([^\/]+?)_(\d+w?|\d+)?\.(avif|webp|png|jpeg|jpg)$/i,
          (_, name) => `/${name}.jpg`
        );
        return `${u.origin}${newPath}`;
      } catch {
        const clean = urlStr.split(/[?#]/)[0];
        const base = clean.replace(/(_\d+w?|\.(avif|webp|png|jpeg|jpg))$/i, '');
        return base + '.jpg';
      }
    }

    function collectPictureJpgs(root) {
      const urls = new Set();
      root.querySelectorAll('picture source[srcset]').forEach(src => {
        const parts = (src.getAttribute('srcset') || '')
          .split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length) {
          const biggest = parts[parts.length - 1].split(' ')[0];
          urls.add(toBaseJpg(biggest));
        }
      });
      return [...urls];
    }

    async function smartDownload(url, filename = 'image.jpg') {
      try {
        chrome.runtime.sendMessage({
          action: "download",
          url: url,
          filename: filename
        });
      } catch (err) {
        console.error('CORS blocked download:', err);
        // window.open(url, '_blank'); // fallback: open in new tab
      }
    }

    // ---------- UI button ----------
    const btn = document.createElement('button');
    btn.textContent = 'Download Images';
    Object.assign(btn.style, {
      border: '1px solid #a20079',
      background: 'transparent',
      color: '#a20079',
      fontWeight: '600',
      fontSize: '14px',
      padding: '6px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      marginTop: '10px'
    });
    btn.addEventListener('mouseenter', () => { btn.style.background = '#a20079'; btn.style.color = '#fff'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; btn.style.color = '#a20079'; });

    const translatedDiv = carousel.querySelector('div[translate]') || carousel;
    translatedDiv.appendChild(btn);

    btn.addEventListener('click', async () => {
      const urls = collectPictureJpgs(carousel);
      if (!urls.length) {
        alert('No images found in <picture> tags.');
        return;
      }
      let i = 1;
      for (const u of urls) {
        const jpg = toBaseJpg(u);
        const parts = jpg.split("/");
        const productId = parts[parts.indexOf("products") + 1];
        smartDownload(jpg, `meesho_image/${productId}_${i++}.jpg`);
        await new Promise(r => setTimeout(r, 150)); // small gap
      }
    });
  }

}