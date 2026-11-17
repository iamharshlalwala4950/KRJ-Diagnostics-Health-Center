(() => {
  "use strict";
  const WHATSAPP_NUMBER = "917088108010"; // KRJ primary enquiry number
  const form = document.getElementById("enquiryForm");
  const enquiryError = document.getElementById("enquiryError");
  const backToTop = document.getElementById("backToTop");
  document.getElementById("year").textContent = new Date().getFullYear();

  // Do not allow selecting a preferred date in the past.
  const dateInput = document.getElementById("preferredDate");
  dateInput.min = new Date().toISOString().split("T")[0];

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("patientName");
    const phone = document.getElementById("patientPhone");
    const selected = [...form.querySelectorAll('input[name="enquiry"]:checked')].map(el => el.value);
    const phoneValid = /^[6-9]\d{9}$/.test(phone.value.trim());
    phone.setCustomValidity(phoneValid || !phone.value ? "" : "Enter a valid 10-digit Indian mobile number.");
    if (!form.checkValidity() || selected.length === 0) {
      form.classList.add("was-validated");
      enquiryError.classList.toggle("show", selected.length === 0);
      if (selected.length === 0) document.querySelector(".enquiry-options").scrollIntoView({behavior:"smooth",block:"center"});
      return;
    }
    enquiryError.classList.remove("show");
    const preferredDate = document.getElementById("preferredDate").value || "Not specified";
    const preferredTime = document.getElementById("preferredTime").value || "Not specified";
    const message = document.getElementById("message").value.trim() || "None";
    const text = [
      "Hello KRJ Diagnostics & Health Center,",
      "",
      "I would like to make an enquiry.",
      `Patient name: ${name.value.trim()}`,
      `Mobile number: ${phone.value.trim()}`,
      `Enquiry for: ${selected.join(", ")}`,
      `Preferred date: ${preferredDate}`,
      `Preferred time: ${preferredTime}`,
      `Additional details: ${message}`,
      "",
      "Please contact me with the relevant information. Thank you."
    ].join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  });

  form.querySelectorAll('input[name="enquiry"]').forEach(input => input.addEventListener("change", () => {
    if (form.querySelector('input[name="enquiry"]:checked')) enquiryError.classList.remove("show");
  }));

  window.addEventListener("scroll", () => backToTop.classList.toggle("show", window.scrollY > 500), {passive:true});
  backToTop.addEventListener("click", () => window.scrollTo({top:0,behavior:"smooth"}));

  // Close the mobile navigation after selecting a section.
  document.querySelectorAll("#mainNav .nav-link, #mainNav .nav-cta").forEach(link => {
    link.addEventListener("click", () => {
      const nav = document.getElementById("mainNav");
      if (nav.classList.contains("show") && window.bootstrap) bootstrap.Collapse.getOrCreateInstance(nav).hide();
    });
  });

  // GSAP progressive enhancement: page remains fully usable if CDN scripts fail.
  if (window.gsap && window.ScrollTrigger && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(".hero-copy > *", {y:24,opacity:0,duration:.8,stagger:.12,ease:"power3.out"});
    gsap.from(".hero-visual-wrap", {y:35,opacity:0,duration:1,ease:"power3.out",delay:.2});
    gsap.utils.toArray(".service-card").forEach((card,i) => {
      gsap.from(card,{y:28,opacity:0,duration:.55,delay:(i%4)*.06,ease:"power2.out",
        scrollTrigger:{trigger:card,start:"top 88%",once:true}});
    });
    gsap.utils.toArray(".about-visual,.about-section .col-lg-7,.contact-info,.enquiry-form,.map-card").forEach(el => {
      gsap.from(el,{y:25,opacity:0,duration:.7,ease:"power2.out",scrollTrigger:{trigger:el,start:"top 88%",once:true}});
    });
    document.querySelectorAll(".counter").forEach(el => {
      const target = Number(el.dataset.target), suffix = el.dataset.suffix || "";
      ScrollTrigger.create({trigger:el,start:"top 90%",once:true,onEnter:()=>{
        gsap.to({value:0},{value:target,duration:1.4,ease:"power2.out",onUpdate:function(){el.textContent=Math.round(this.targets()[0].value)+suffix;}});
      }});
    });
  } else {
    document.querySelectorAll(".counter").forEach(el => el.textContent = el.dataset.target + (el.dataset.suffix || ""));
  }

  // Three.js: subtle rotating wireframe rings in the hero. CSS fallback stays visible.
  const mount = document.getElementById("hero-visual");
  if (window.THREE && mount && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, mount.clientWidth/mount.clientHeight, .1, 100);
      camera.position.z = 7;
      const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.setSize(mount.clientWidth,mount.clientHeight);
      renderer.domElement.className = "three-canvas";
      renderer.domElement.setAttribute("aria-hidden","true");
      mount.prepend(renderer.domElement);
      const group = new THREE.Group(); scene.add(group);
      const material = new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.25});
      const geometry = new THREE.TorusGeometry(2.15,.012,8,100);
      const ring1 = new THREE.Mesh(geometry,material); ring1.rotation.x=.9; ring1.rotation.y=.4; group.add(ring1);
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.65,.009,8,100),material.clone()); ring2.material.opacity=.2; ring2.rotation.x=1.7; ring2.rotation.y=-.5; group.add(ring2);
      let frame;
      const animate = () => { frame=requestAnimationFrame(animate); group.rotation.y += .0018; group.rotation.z += .0008; renderer.render(scene,camera); };
      animate();
      const resize = () => {const w=mount.clientWidth,h=mount.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);};
      window.addEventListener("resize",resize);
      document.addEventListener("visibilitychange",()=>{if(document.hidden)cancelAnimationFrame(frame);else animate();});
    } catch (error) { console.warn("3D visual fallback active.", error); }
  }
})();