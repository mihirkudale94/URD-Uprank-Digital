import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";
import Typewriter from "@/components/Typewriter";
import Counter from "@/components/Counter";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.floatingSphere + " " + styles.sphere1}></div>
        <div className={styles.floatingSphere + " " + styles.sphere2}></div>
        <div className={styles.hero3d}>
          <div className={styles.cube}>
            <div className={`${styles.cubeFace} ${styles.faceFront}`}></div>
            <div className={`${styles.cubeFace} ${styles.faceBack}`}></div>
            <div className={`${styles.cubeFace} ${styles.faceRight}`}></div>
            <div className={`${styles.cubeFace} ${styles.faceLeft}`}></div>
            <div className={`${styles.cubeFace} ${styles.faceTop}`}></div>
            <div className={`${styles.cubeFace} ${styles.faceBottom}`}></div>
          </div>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.badge}>Next-Gen Digital Agency</div>
          <h1 className={`${styles.title} animate-fade-in`}>
            We Help Brands <br/>
            <span className="heading-gradient">
              <Typewriter words={["Develop", "Design", "Scale"]} />
            </span>
            <br />
            &nbsp;their Digital Future
          </h1>
          <p className={`${styles.subtitle} animate-fade-in`} style={{ animationDelay: "0.3s" }}>
            Transforming complex business challenges into intuitive digital experiences that drive real growth.
          </p>
          <div className={`${styles.ctaGroup} animate-fade-in`} style={{ animationDelay: "0.55s" }}>
            <Link href="/about#contact-form" className="btn-primary">
              CONTACT US
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className={styles.section} id="impact">
        <div className={styles.impactGrid}>
          <ScrollReveal delayClass="revealDelay1">
            <div className={`bento-card tilt-card ${styles.impactCard}`}>
              <div className={styles.impactValue}>
                <Counter target={9} suffix="+" duration={1800} />
              </div>
              <div className={styles.impactLabel}>Years of Experience</div>
            </div>
          </ScrollReveal>
          <ScrollReveal delayClass="revealDelay2">
            <div className={`bento-card tilt-card ${styles.impactCard}`}>
              <div className={styles.impactValue}>
                <Counter target={100} suffix="%" duration={2000} />
              </div>
              <div className={styles.impactLabel}>Transparency &amp; Trust</div>
            </div>
          </ScrollReveal>
          <ScrollReveal delayClass="revealDelay3">
            <div className={`bento-card tilt-card ${styles.impactCard}`}>
              <div className={styles.impactValue}>
                <Counter target={3} suffix="+" duration={1500} />
              </div>
              <div className={styles.impactLabel}>Global Market Regions</div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Who Are We */}
      <section className={styles.section} id="who-we-are">
        <ScrollReveal>
          <div className={`bento-card tilt-card ${styles.whoBento}`}>
            <div className={styles.whoText}>
              <h2 className={styles.sectionTitle}>Who are we</h2>
              <p className={styles.text}>
                <strong className={styles.highlightText}>A Progressive Digital Agency with Creative Spark.</strong><br/><br/>
                We bridge the gap between human intuition and digital performance. Established to help brands connect deeply with their audience through innovative strategies that deliver measurable market results.
              </p>
            </div>
            <div className={styles.whoImage}>
              <Image
                src="/img/who-we-are.webp"
                alt="Who We Are — Uprank Digital team"
                width={600}
                height={400}
                className={styles.imgRounded}
                style={{ width: '100%', height: 'auto' }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* How We Do */}
      <section className={styles.section} id="how-we-do">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitleCenter}>What we do &amp; How we do it</h2>
          <p className={styles.textCenter}>A proven four-stage framework designed for scalability and precision.</p>
        </div>
        <div className={styles.bentoGrid4}>
          {[
            { title: "Ask", icon: "/img/Chat.svg", text: "We start by uncovering the unique DNA of your business and exploring your core objectives." },
            { title: "Think", icon: "/img/Category.svg", text: "Strategic brainstorming to translate insights into high-impact digital roadmaps." },
            { title: "Create", icon: "/img/Star.svg", text: "The magic happens here. We build, design, and develop your vision into a digital reality." },
            { title: "Repeat", icon: "/img/Swap.svg", text: "Iterative refinement ensures your goals are met with absolute precision at every stage." }
          ].map((step, index) => (
            <ScrollReveal key={index} delayClass={`revealDelay${index + 1}`}>
                <div className={`bento-card tilt-card ${styles.stepCard}`}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepNum}>0{index + 1}</span>
                    <Image src={step.icon} alt={step.title} width={48} height={48} className={styles.stepIcon} style={{ width: 'auto', height: 'auto' }} />
                  </div>
                  <h3 className={styles.cardTitle}>{step.title}</h3>
                  <p className={styles.textSmall}>{step.text}</p>
                </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* What We Offer */}
      <section className={styles.section} id="what-we-offer">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitleCenter}>What we offer</h2>
          <p className={styles.textCenter}>End-to-end digital services designed to accelerate your brand's growth and digital maturity.</p>
        </div>
        <div className={styles.offerBento}>
          {/* Digital */}
          <ScrollReveal className={styles.offerLarge} delayClass="revealDelay1">
            <div className="bento-card tilt-card" style={{ height: '100%', display: 'flex', gap: '40px', alignItems: 'center' }}>
              <div className={styles.offerContent}>
                <h3 className={styles.cardTitle}>Digital Excellence</h3>
                <p className={styles.textSmall}>Transforming your brand into a high-performance digital asset that drives traffic and converts visitors into loyal customers.</p>
                <ul className={styles.featureList}>
                  <li>Graphic Design &amp; Branding</li>
                  <li>UI/UX &amp; Web Design</li>
                  <li>E-commerce Development</li>
                  <li>Custom CMS &amp; Web Apps</li>
                </ul>

              </div>
              <Image
                src="/img/v2_digital.png"
                alt="Digital Excellence services"
                width={200}
                height={200}
                className={styles.offerImg}
                style={{ width: 'auto', height: 'auto' }}
                sizes="200px"
              />
            </div>
          </ScrollReveal>

          {/* Marketing */}
          <ScrollReveal className={styles.offerMedium} delayClass="revealDelay2">
            <div className="bento-card tilt-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className={styles.cardTitle}>Precision Marketing</h3>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                <Image src="/img/v2_marketing.png" alt="Precision Marketing" width={200} height={200} style={{ width: 'auto', height: 'auto' }} sizes="200px" />
              </div>
              <p className={styles.textSmall}>Right platform. Right audience. Real results that amplify your brand's reach and authority.</p>
              <ul className={styles.featureList}>
                <li>Search Engine SEO</li>
                <li>Social Media Growth</li>
                <li>Content Strategy</li>
                <li>Performance Ads</li>
              </ul>

            </div>
          </ScrollReveal>

          {/* Advertising */}
          <ScrollReveal className={styles.offerMedium} delayClass="revealDelay1">
            <div className="bento-card tilt-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className={styles.cardTitle}>Strategic Advertising</h3>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                <Image src="/img/v2_advertising.png" alt="Strategic Advertising" width={200} height={200} style={{ width: 'auto', height: 'auto' }} sizes="200px" />
              </div>
              <p className={styles.textSmall}>ROI-focused campaigns designed for maximum engagement and market impact across all channels.</p>
              <ul className={styles.featureList}>
                <li>PPC Campaigns</li>
                <li>Display Advertising</li>
                <li>PR &amp; Media Buying</li>
                <li>Paid PR Distribution</li>
              </ul>

            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal className={styles.offerMedium} delayClass="revealDelay2">
            <div className="bento-card tilt-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className={styles.cardTitle}>Creative Content</h3>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                <Image src="/img/v2_content.png" alt="Creative Content" width={200} height={200} style={{ width: 'auto', height: 'auto' }} sizes="200px" />
              </div>
              <p className={styles.textSmall}>Compelling stories via words, graphics, and video that strengthen audience relationships.</p>
              <ul className={styles.featureList}>
                <li>Copywriting</li>
                <li>Video Production</li>
                <li>Product Photoshoots</li>
                <li>Animations &amp; Motion</li>
              </ul>
            </div>
          </ScrollReveal>

          {/* Software */}
          <ScrollReveal className={styles.offerMedium} delayClass="revealDelay3">
            <div className="bento-card tilt-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className={styles.cardTitle}>Enterprise Software</h3>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                <Image src="/img/v2_software.png" alt="Enterprise Software" width={200} height={200} style={{ width: 'auto', height: 'auto' }} sizes="200px" />
              </div>
              <p className={styles.textSmall}>Scalable, reliable, and cost-effective software solutions built for business performance.</p>
              <ul className={styles.featureList}>
                <li>SaaS &amp; Product Development</li>
                <li>CMS Solutions</li>
                <li>LMS (Learning Management)</li>
                <li>CRM &amp; ERP Solutions</li>
              </ul>
            </div>
          </ScrollReveal>

          {/* Autonomous AI & Agents */}
          <ScrollReveal className={styles.offerLarge} delayClass="revealDelay1">
            <div className="bento-card tilt-card" style={{ height: '100%', display: 'flex', gap: '40px', alignItems: 'center' }}>
              <div className={styles.offerContent}>
                <h3 className={styles.cardTitle}>AI-Driven Growth &amp; Automation</h3>
                <p className={styles.textSmall}>Integrate intelligent AI models to automate your marketing campaigns, hyper-personalize customer experiences, and scale lead generation with unprecedented precision.</p>
                <ul className={styles.featureList}>
                  <li>AI-Driven SEO &amp; Content</li>
                  <li>Automated Lead Nurturing</li>
                  <li>Predictive ROI Targeting</li>
                  <li>Intelligent Concierge Bots</li>
                </ul>

              </div>
              <Image
                src="/img/v2_ai_automation.png"
                alt="AI-Driven Growth and Automation"
                width={200}
                height={200}
                className={styles.offerImg}
                style={{ width: 'auto', height: 'auto' }}
                sizes="200px"
                priority
              />
            </div>
          </ScrollReveal>
          {/* Business Intelligence */}
          <ScrollReveal className={styles.offerMedium} delayClass="revealDelay2">
            <div className="bento-card tilt-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className={styles.cardTitle}>Growth Analytics &amp; BI</h3>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                <Image src="/img/v2_bi.png" alt="Growth Analytics and BI" width={200} height={200} style={{ width: 'auto', height: 'auto' }} sizes="200px" />
              </div>
              <p className={styles.textSmall}>Transform scattered marketing data into clear dashboards. Attribute ROI accurately and make growth decisions with absolute confidence.</p>
              <ul className={styles.featureList}>
                <li>Cross-Channel Attribution</li>
                <li>Real-time ROI Dashboards</li>
                <li>Competitor Intelligence</li>
                <li>Predictive Sales Funnels</li>
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>


      {/* Who We Work With */}
      <section className={styles.section} id="clients">
        <ScrollReveal>
          <h2 className={styles.sectionTitleCenter}>Who we work with</h2>
          <div className={styles.logoMarquee}>
            <div className={styles.logoTrack}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map((i, idx) => (
                <div key={idx} className={styles.logoItem}>
                  <Image
                    src={`/img/Logo Clouds/Logo ${i}.png`}
                    alt={`Client ${i}`}
                    width={120}
                    height={60}
                    style={{ width: '120px', height: '60px', objectFit: 'contain' }}
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Testimonials */}
      <section className={styles.section} id="client">
        <h2 className={styles.sectionTitleCenter}>What our clients say</h2>
        <div className={styles.testimonialsGrid}>
          {[
            { text: "We developed a great bonding with Up Rank Digital and their dedication to our website is evident in all aspects of the site. We appreciate their attention to detail and creative approach to bringing our new exhibit to life online.", name: "Mr. Achyut Chitale", title: "MD, Candid Confectioneries", img: "/img/Testimonial/p1.png" },
            { text: "Up Rank Digital is a master at making your website fantasies come true. They handle things very efficiently and keep us updated with performance posts. I would highly recommend them to anyone in need of web development or SEO services!", name: "Dr. Vasudha Keskar", title: "Founder, Kanak Jaggery", img: "/img/Testimonial/p2.png" },
            { text: "We were very pleased with the work of Up Rank Digital. They were very thorough and professional in their approach. We were able to launch our new website on time and within budget. I would highly recommend them!", name: "Nishit Patel", title: "Founder, Nisara", img: "/img/user-placeholder.png" },
            { text: "With their help, we were able to do 17 product shoots within just 2 days during the pandemic, which helped us grow in US and UK. Their commitment is visible in every element of our digital branding.", name: "Mr. Prasad Apte", title: "MD, Shree Devashree Foods", img: "/img/Testimonial/p3.png" },
            { text: "Our site views and simplicity of maintenance have improved dramatically. Every step of the way, I was heard and valued. Our new website has exceeded our expectations.", name: "Mr. Abhijeet Gangdhar", title: "Owner, Gangdhar Mithaiwale", img: "/img/Testimonial/p4.png" }
          ].map((item, i) => (
            <ScrollReveal key={i} delayClass={`revealDelay${i + 1}`}>
              <div className={`bento-card tilt-card ${styles.testCard}`}>
                <p className={styles.quote}>&ldquo;{item.text}&rdquo;</p>
                <div className={styles.clientProfile}>
                  <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
                    <Image
                      src={item.img}
                      alt={item.name}
                      fill
                      className={styles.clientAvatar}
                      style={{ objectFit: 'cover' }}
                      sizes="56px"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h4 className={styles.clientName}>{item.name}</h4>
                    <p className={styles.clientTitle}>{item.title}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>


      {/* Final CTA */}
      <section className={styles.finalCta}>
        <ScrollReveal>
          <div className={`bento-card tilt-card ${styles.ctaContainer}`}>
            <h2 className={styles.sectionTitleCenter}>Ready to Ignite Your Growth?</h2>
            <p className={styles.textCenter}>Let&apos;s build the future of your brand today.</p>
            <div className={styles.ctaButton}>
              <Link href="/about#contact-form" className="btn-primary">Start Your Project</Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
