import React from 'react';
import { cvData } from './data/cvData';

function App() {
  const { name, nameZh, contact, bio, researchInterests, education, experience, publicationGroups } = cvData;

  return (
    <div className="page">
      <main className="container">
        {/* Header: photo + bio */}
        <header className="header">
          <div className="header-photo">
            <img src={contact.photo} alt={name} />
          </div>

          <div className="header-info">
            <h1 className="name">
              {name}
              {nameZh && <span className="name-zh"> ({nameZh})</span>}
            </h1>

            <p className="affiliation">
              Joint PhD Student,{' '}
              {cvData.affiliations.map((aff, i) => (
                <React.Fragment key={aff.name}>
                  <a href={aff.url} target="_blank" rel="noopener noreferrer">{aff.name}</a>
                  {i < cvData.affiliations.length - 1 ? ' & ' : ''}
                </React.Fragment>
              ))}
            </p>

            <p className="advisors">
              Advised by{' '}
              <a href="https://xpqiu.github.io/" target="_blank" rel="noopener noreferrer">Xipeng Qiu</a>
              {' '}and Wenhao Huang.
            </p>

            <ul className="contact-list">
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <a href={contact.scholar} target="_blank" rel="noopener noreferrer">Google Scholar</a>
                <span className="sep">/</span>
                <a href={contact.cv} target="_blank" rel="noopener noreferrer">CV</a>
              </li>
              <li className="muted">{contact.location}</li>
            </ul>
          </div>
        </header>

        {/* About */}
        <section className="section">
          <h2 className="section-title">About</h2>
          {bio.map((p, i) => (
            <p key={i} className="prose">{p}</p>
          ))}
          <p className="prose">
            <strong>Research interests:</strong>{' '}
            {researchInterests.join(' · ')}.
          </p>
        </section>

        {/* Experience */}
        <section className="section">
          <h2 className="section-title">Experience</h2>
          <ul className="entry-list">
            {experience.map((exp, i) => (
              <li key={i} className="entry">
                <div className="entry-head">
                  <span className="entry-title">{exp.company}</span>
                  <span className="entry-period">{exp.period}</span>
                </div>
                <div className="entry-sub">
                  <span className="italic">{exp.role}</span>
                  <span className="muted small"> · {exp.location}</span>
                </div>
                {exp.bullets && (
                  <ul className="bullet-list">
                    {exp.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Publications */}
        <section className="section">
          <h2 className="section-title">Publications</h2>
          <p className="prose muted small">
            <a href={contact.scholar} target="_blank" rel="noopener noreferrer">Full list on Google Scholar</a>.
            {' '}<sup>*</sup> indicates equal contribution.
          </p>

          {publicationGroups.map((group) => (
            <div key={group.topic} className="pub-group">
              <h3 className="pub-topic">{group.topic}</h3>
              <ol className="pub-list">
                {group.items.map((pub, idx) => (
                  <li key={idx} className="pub-item">
                    <div className="pub-title">{pub.title}</div>
                    <div className="pub-authors">
                      {renderAuthors(pub.authors, name)}
                    </div>
                    <div className="pub-meta">
                      <span className="pub-venue">{pub.venue}, {pub.year}</span>
                      {pub.links?.pdf && (
                        <>
                          <span className="sep">·</span>
                          <a href={pub.links.pdf} target="_blank" rel="noopener noreferrer">pdf</a>
                        </>
                      )}
                      {pub.tag && (
                        <span className="pub-tag">{pub.tag}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>

        {/* Education */}
        <section className="section">
          <h2 className="section-title">Education</h2>
          <ul className="entry-list">
            {education.map((edu, i) => (
              <li key={i} className="entry">
                <div className="entry-head">
                  <span className="entry-title">{edu.school}</span>
                  <span className="entry-period">{edu.period}</span>
                </div>
                <div className="entry-sub">
                  <span className="italic">{edu.degree}</span>
                  <span className="muted small"> · {edu.location}</span>
                </div>
                {edu.mentors && (
                  <div className="muted small">{edu.mentors}</div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <footer className="footer">
          <p>
            Last updated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}.
            {' '}Built with React. Inspired by academic homepages.
          </p>
        </footer>
      </main>
    </div>
  );
}

function renderAuthors(authorsStr, myName) {
  const parts = authorsStr.split(/(,\s*)/);
  return parts.map((part, i) => {
    const cleaned = part.replace(/\*/g, '').trim();
    if (cleaned === myName) {
      const hasStar = part.includes('*');
      return (
        <strong key={i}>
          {myName}{hasStar ? '*' : ''}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export default App;
