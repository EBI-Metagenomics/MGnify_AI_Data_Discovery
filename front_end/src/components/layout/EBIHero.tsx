import React from 'react';

interface EBIHeroProps {
  kicker?: {
    text: string;
    link?: string;
  };
  heading: {
    text: string;
    link?: string;
  };
  subheading?: string;
  text?: string;
  textLinks?: Array<{
    text: string;
    link: string;
  }>;
  callToAction?: {
    text: string;
    link: string;
  };
  backgroundImageSize?: string;
}

const EBIHero: React.FC<EBIHeroProps> = ({
  kicker,
  heading,
  subheading,
  text,
  textLinks = [],
  callToAction,
  backgroundImageSize = 'auto 28.5rem'
}) => {
  // Function to replace links in text with actual anchor tags
  const renderTextWithLinks = (text: string) => {
    if (!textLinks || textLinks.length === 0) return text;
    
    let result = text;
    textLinks.forEach(link => {
      result = result.replace(
        link.text,
        `<a href="${link.link}">${link.text}</a>`
      );
    });
    
    return (
      <span dangerouslySetInnerHTML={{ __html: result }} />
    );
  };

  return (
    <section className="vf-hero | vf-u-fullbleed" style={{ '--vf-hero--bg-image-size': backgroundImageSize } as React.CSSProperties}>
      <div className="vf-hero__content | vf-box | vf-stack vf-stack--400">
        {kicker && (
          <p className="vf-hero__kicker">
            {kicker.link ? (
              <a href={kicker.link}>{kicker.text}</a>
            ) : (
              kicker.text
            )}
            {kicker.text.includes('|') ? '' : ' | Structural Biology'}
          </p>
        )}
        
        <h1 className="vf-hero__heading">
          {heading.link ? (
            <a className="vf-hero__heading_link" href={heading.link}>
              {heading.text}
            </a>
          ) : (
            heading.text
          )}
        </h1>

        {subheading && (
          <p className="vf-hero__subheading">{subheading}</p>
        )}
        
        {text && (
          <p className="vf-hero__text">
            {renderTextWithLinks(text)}
          </p>
        )}
        
        {callToAction && (
          <a className="vf-hero__link" href={callToAction.link}>
            {callToAction.text}
            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 12c0 6.627 5.373 12 12 12s12-5.373 12-12S18.627 0 12 0C5.376.008.008 5.376 0 12zm13.707-5.209l4.5 4.5a1 1 0 010 1.414l-4.5 4.5a1 1 0 01-1.414-1.414l2.366-2.367a.25.25 0 00-.177-.424H6a1 1 0 010-2h8.482a.25.25 0 00.177-.427l-2.366-2.368a1 1 0 011.414-1.414z"
                fill=""
                fillRule="nonzero"
              ></path>
            </svg>
          </a>
        )}
      </div>
    </section>
  );
};

export default EBIHero;