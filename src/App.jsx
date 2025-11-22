import React from 'react';
import { cvData } from './data/cvData';
import { Mail, Github, MapPin, ExternalLink, BookOpen, GraduationCap, Briefcase, FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <motion.header
        className="section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center mb-6">

          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(45deg, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {cvData.name}
          </h1>
        </div>
        <p className="text-secondary" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
          {cvData.title} @ {cvData.affiliations.join(' & ')}
        </p>

        <div className="flex gap-4 text-sm text-secondary">
          <a href={`mailto:${cvData.contact.email}`} className="flex items-center gap-2 hover:text-primary">
            <Mail size={16} /> {cvData.contact.email}
          </a>
          <span className="flex items-center gap-2">
            <MapPin size={16} /> {cvData.contact.location}
          </span>
          <a href="/CV.pdf" className="flex items-center gap-2 hover:text-primary" target="_blank" rel="noopener noreferrer">
            <BookOpen size={16} /> CV
          </a>
          {/* <a href={cvData.contact.github} className="flex items-center gap-2 hover:text-primary">
            <Github size={16} /> GitHub
          </a> */}
        </div>
      </motion.header>

      {/* Research Interests */}
      <motion.section
        className="section"
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <h2 className="section-title flex items-center gap-2">
          <FlaskConical size={24} /> Research Interests
        </h2>
        <div className="flex gap-2 flex-wrap">
          {cvData.researchInterests.map((interest, index) => (
            <span key={index} style={{
              padding: '0.5rem 1rem',
              background: 'var(--bg-secondary)',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              {interest}
            </span>
          ))}
        </div>
      </motion.section>

      {/* Education */}
      <motion.section
        className="section"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <h2 className="section-title flex items-center gap-2">
          <GraduationCap size={24} /> Education
        </h2>
        <div className="flex flex-col gap-4">
          {cvData.education.map((edu, index) => (
            <motion.div key={index} className="card" variants={fadeInUp}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold" style={{ fontSize: '1.1rem' }}>{edu.school}</h3>
                <span className="text-sm text-secondary">{edu.location}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="italic">{edu.degree}</span>
                <span className="text-sm text-secondary">{edu.period}</span>
              </div>
              {edu.mentors && (
                <p className="text-sm text-secondary">Mentors: {edu.mentors}</p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Publications */}
      <motion.section
        className="section"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <h2 className="section-title flex items-center gap-2">
          <BookOpen size={24} /> Publications
        </h2>
        <div className="flex flex-col gap-4">
          {cvData.publications.map((pub, index) => (
            <motion.div key={index} className="card" variants={fadeInUp}>
              <h3 className="font-bold mb-2" style={{ fontSize: '1.1rem' }}>{pub.title}</h3>
              <p className="text-sm text-secondary mb-2">{pub.authors}</p>
              <div className="flex justify-between items-center">
                <span className="italic text-sm" style={{ color: 'var(--accent-green)' }}>{pub.venue}, {pub.year}</span>
                {pub.links.pdf && (
                  <a href={pub.links.pdf} className="flex items-center gap-1 text-sm font-bold" target="_blank" rel="noopener noreferrer">
                    PDF <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Experience */}
      <motion.section
        className="section"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <h2 className="section-title flex items-center gap-2">
          <Briefcase size={24} /> Industry Experience
        </h2>
        <div className="flex flex-col gap-4">
          {cvData.experience.map((exp, index) => (
            <motion.div key={index} className="card" variants={fadeInUp}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold" style={{ fontSize: '1.1rem' }}>{exp.company}</h3>
                <span className="text-sm text-secondary">{exp.location}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="italic">{exp.role}</span>
                <span className="text-sm text-secondary">{exp.period}</span>
              </div>
              <p className="text-sm text-secondary">{exp.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <footer className="text-center text-secondary text-sm py-8">
        <p>&copy; {new Date().getFullYear()} {cvData.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
