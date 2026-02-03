import React, { useState } from 'react';

export default function MarketingSuite() {
  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [apiTestResult, setApiTestResult] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [contentLibrary, setContentLibrary] = useState([]);
  const [currentModuleName, setCurrentModuleName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [filterBusinessType, setFilterBusinessType] = useState('All');
  const [filterModule, setFilterModule] = useState('All');
  const [viewingLibraryItem, setViewingLibraryItem] = useState(null);
  const [showQuickNav, setShowQuickNav] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Rich Output Formatter — converts plain text AI output into styled JSX
  const formatOutput = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let bulletItems = [];

    const flushBullets = () => {
      if (bulletItems.length > 0) {
        elements.push(
          <div key={`bullets-${elements.length}`} style={{paddingLeft: '4px', margin: '8px 0 12px 0'}}>
            {bulletItems.map((b) => b)}
          </div>
        );
        bulletItems = [];
      }
    };

    // Inline styling: **bold**, *italic*
    const styleInline = (str) => {
      // First pass: **bold**
      const parts = str.split(/\*\*(.*?)\*\*/g);
      const result = [];
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 1) {
          result.push(<strong key={`b${i}`} style={{color: '#1e40af', fontWeight: 700}}>{parts[i]}</strong>);
        } else {
          // Second pass on non-bold parts: *italic*
          const italicParts = parts[i].split(/\*(.*?)\*/g);
          for (let j = 0; j < italicParts.length; j++) {
            if (j % 2 === 1) {
              result.push(<em key={`i${i}-${j}`} style={{color: '#64748b', fontStyle: 'italic'}}>{italicParts[j]}</em>);
            } else if (italicParts[j]) {
              result.push(italicParts[j]);
            }
          }
        }
      }
      return result.length === 1 && typeof result[0] === 'string' ? result[0] : result;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // ── Empty lines ──
      if (trimmed === '') {
        flushBullets();
        elements.push(<div key={`space-${i}`} style={{height: '10px'}} />);
        continue;
      }

      // ── Separator lines (━━━ or ─── or === or --- or ~~~) ──
      if (/^[\s━─═\-~*]{3,}$/.test(trimmed) && !trimmed.match(/[a-zA-Z]/)) {
        flushBullets();
        elements.push(
          <hr key={`sep-${i}`} style={{border: 'none', height: '3px', background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #3b82f6)', margin: '20px 0', borderRadius: '2px', opacity: 0.6}} />
        );
        continue;
      }

      // ── Markdown H1: # Title ──
      if (/^#\s+/.test(trimmed) && !/^##/.test(trimmed) && !/^#\w/.test(trimmed)) {
        flushBullets();
        const content = trimmed.replace(/^#\s+/, '');
        elements.push(
          <div key={`h1-${i}`} style={{background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', color: 'white', padding: '18px 24px', borderRadius: '12px', margin: '24px 0 16px 0', fontWeight: 900, fontSize: '18px', letterSpacing: '0.5px', textAlign: 'center', borderBottom: '4px solid #f59e0b', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'}}>
            {content}
          </div>
        );
        continue;
      }

      // ── Markdown H2: ## Subtitle (but not ###) ──
      if (/^##[^#]\s*/.test(trimmed)) {
        flushBullets();
        const content = trimmed.replace(/^##\s+/, '').replace(/\*\*/g, '');
        elements.push(
          <div key={`h2-${i}`} style={{background: 'linear-gradient(135deg, #1e3a5f, #312e81)', color: 'white', padding: '14px 20px', borderRadius: '10px', margin: '24px 0 12px 0', fontWeight: 800, fontSize: '15px', letterSpacing: '0.5px', borderLeft: '5px solid #8b5cf6', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'}}>
            {content}
          </div>
        );
        continue;
      }

      // ── Markdown H3: ### Header (with optional **bold** inside) ──
      if (/^###\s+/.test(trimmed)) {
        flushBullets();
        const content = trimmed.replace(/^###\s+/, '').replace(/\*\*/g, '');
        // Determine style based on content
        const isPiece = /PIECE\s*#?\d/i.test(content);
        const isEmailPostText = /^(EMAIL|POST|TEXT|BLOG|SCRIPT)\s*#?\d/i.test(content);
        const isSectionLabel = /^(🎯|✅|💰|📊|📞|⚠️|🗓️|📅|📋)/.test(content) || /^[A-Z\s]{4,}:?\s*$/i.test(content.replace(/[^\w\s:]/g, ''));
        if (isPiece) {
          elements.push(
            <div key={`h3piece-${i}`} style={{background: 'linear-gradient(135deg, #0c4a6e, #1e3a5f, #312e81)', color: 'white', padding: '16px 22px', borderRadius: '12px', margin: '32px 0 14px 0', fontWeight: 900, fontSize: '16px', letterSpacing: '0.8px', borderLeft: '6px solid #f59e0b', boxShadow: '0 3px 10px rgba(0,0,0,0.2)'}}>
              {content}
            </div>
          );
        } else if (isEmailPostText) {
          elements.push(
            <div key={`h3sub-${i}`} style={{background: 'linear-gradient(135deg, #1e40af, #4338ca)', color: 'white', padding: '12px 18px', borderRadius: '10px', margin: '22px 0 10px 0', fontWeight: 800, fontSize: '14px', letterSpacing: '0.5px', borderLeft: '5px solid #22d3ee', boxShadow: '0 2px 6px rgba(0,0,0,0.12)'}}>
              {content}
            </div>
          );
        } else if (isSectionLabel) {
          elements.push(
            <div key={`h3sec-${i}`} style={{background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: '2px solid #cbd5e1', borderLeft: '5px solid #f59e0b', borderRadius: '10px', padding: '12px 18px', margin: '22px 0 10px 0', fontWeight: 800, fontSize: '14px', color: '#1e293b', letterSpacing: '0.5px'}}>
              {content}
            </div>
          );
        } else {
          elements.push(
            <div key={`h3-${i}`} style={{background: 'linear-gradient(135deg, #1e3a5f, #312e81)', color: 'white', padding: '12px 18px', borderRadius: '10px', margin: '20px 0 10px 0', fontWeight: 800, fontSize: '14px', letterSpacing: '0.3px', borderLeft: '4px solid #a78bfa', boxShadow: '0 2px 6px rgba(0,0,0,0.12)'}}>
              {content}
            </div>
          );
        }
        continue;
      }

      // ── PIECE headers (📧 PIECE #1:, 📱 PIECE #5:, etc.) ──
      if (/PIECE\s*#?\d/i.test(trimmed)) {
        flushBullets();
        elements.push(
          <div key={`piece-${i}`} style={{background: 'linear-gradient(135deg, #0c4a6e, #1e3a5f, #312e81)', color: 'white', padding: '16px 22px', borderRadius: '12px', margin: '32px 0 14px 0', fontWeight: 900, fontSize: '16px', letterSpacing: '0.8px', borderLeft: '6px solid #f59e0b', boxShadow: '0 3px 10px rgba(0,0,0,0.2)', textTransform: 'uppercase'}}>
            {trimmed}
          </div>
        );
        continue;
      }

      // ── DAY / POST / EMAIL / TEXT / WEEK / SCRIPT sub-headers ──
      if (/^(.*?\s*)?(DAY|POST|WEEK|SCRIPT|PART|SECTION|EMAIL|TEXT|BLOG)\s*#?\d/i.test(trimmed) && trimmed.length < 120) {
        flushBullets();
        const cleanContent = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '');
        elements.push(
          <div key={`sub-${i}`} style={{background: 'linear-gradient(135deg, #1e40af, #4338ca)', color: 'white', padding: '12px 18px', borderRadius: '10px', margin: '22px 0 10px 0', fontWeight: 800, fontSize: '14px', letterSpacing: '0.5px', borderLeft: '5px solid #22d3ee', boxShadow: '0 2px 6px rgba(0,0,0,0.12)'}}>
            {cleanContent}
          </div>
        );
        continue;
      }

      // ── Section header labels (HEADLINE:, SUBHEADLINE:, CONTACT INFO:, FOOTER:, DESIGN NOTES:, etc.) ──
      if (/^(HEADLINE|SUBHEADLINE|CONTACT\s*INFO|FOOTER|DESIGN\s*NOTES|SERVICE\s*AREA|GUARANTEE|TESTIMONIAL)\s*:/i.test(trimmed)) {
        flushBullets();
        const label = trimmed.substring(0, trimmed.indexOf(':') + 1);
        const rest = trimmed.substring(trimmed.indexOf(':') + 1).trim();
        elements.push(
          <div key={`seclabel-${i}`} style={{background: '#f8fafc', border: '2px solid #e2e8f0', borderLeft: '5px solid #f59e0b', borderRadius: '8px', padding: '10px 16px', margin: '16px 0 8px 0'}}>
            <span style={{color: '#b45309', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px'}}>{label}</span>
            {rest && <span style={{color: '#334155', marginLeft: '8px'}}>{styleInline(rest)}</span>}
          </div>
        );
        continue;
      }

      // ── Platform labels ──
      if (/^Platform\s*:/i.test(trimmed)) {
        flushBullets();
        elements.push(
          <div key={`plat-${i}`} style={{display: 'inline-block', background: '#ede9fe', color: '#6d28d9', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '4px 12px', borderRadius: '20px', marginBottom: '8px'}}>
            📱 {trimmed}
          </div>
        );
        continue;
      }

      // ── Post Type / Offer labels ──
      if (/^(Post\s*Type|Offer)\s*:/i.test(trimmed)) {
        flushBullets();
        const label = trimmed.substring(0, trimmed.indexOf(':') + 1);
        const rest = trimmed.substring(trimmed.indexOf(':') + 1).trim();
        elements.push(
          <div key={`ptype-${i}`} style={{display: 'inline-block', background: '#dbeafe', color: '#1e40af', fontWeight: 700, fontSize: '12px', padding: '4px 14px', borderRadius: '20px', marginBottom: '8px'}}>
            {label} <span style={{fontWeight: 800}}>{rest}</span>
          </div>
        );
        continue;
      }

      // ── Field labels: Subject Line:, Body:, Title:, Description:, Hook:, CTA:, etc. ──
      const labelMatch = trimmed.match(/^(Subject\s*Line|Preview\s*Text|Body|Title|Hook|CTA|Format|Tone|Word\s*count|Include|Result|Framework|SEO|Caption|Hashtags|Description|What\s+we\s+\w+|Why\s+\w+|Complete\s+\w+|What\s+you\s+get|Available|Spots\s+remaining|Special\s+Price|Average\s+savings)\s*:/i);
      if (labelMatch) {
        flushBullets();
        const colonIdx = trimmed.indexOf(':');
        const label = trimmed.substring(0, colonIdx + 1);
        const rest = trimmed.substring(colonIdx + 1).trim();
        elements.push(
          <div key={`label-${i}`} style={{margin: '8px 0', lineHeight: '1.7'}}>
            <span style={{color: '#dc2626', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#fef2f2', padding: '2px 8px', borderRadius: '4px'}}>{label}</span>
            {rest && <span style={{color: '#334155', marginLeft: '6px'}}>{styleInline(rest)}</span>}
          </div>
        );
        continue;
      }

      // ── Engagement Question lines ──
      if (/^💬\s*(Engagement\s*Question)/i.test(trimmed)) {
        flushBullets();
        elements.push(
          <div key={`engage-${i}`} style={{background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '2px solid #f59e0b', borderRadius: '10px', padding: '12px 16px', margin: '16px 0', fontWeight: 600, color: '#92400e', fontSize: '14px'}}>
            {trimmed}
          </div>
        );
        continue;
      }

      // ── Money / CTA / Urgency highlight lines (💰, 📞, ⏰, 🚨, 📊, etc.) ──
      if (/^(💰|📞|⏰|🚨|📊|🎯|💡|🔥|📌|✨|🚀|⚠️|🍂|📧|🌐|📍|📋|📅|📈|📱)/.test(trimmed) && trimmed.length > 10) {
        flushBullets();
        const emoji = [...trimmed][0];
        const rest = trimmed.substring(emoji.length).trim();
        // Determine color based on emoji
        let bg, border, textColor;
        if ('💰📊📈'.includes(emoji)) { bg = '#ecfdf5'; border = '#10b981'; textColor = '#065f46'; }
        else if ('📞🌐📧'.includes(emoji)) { bg = '#eff6ff'; border = '#3b82f6'; textColor = '#1e40af'; }
        else if ('⏰🚨⚠️'.includes(emoji)) { bg = '#fef2f2'; border = '#ef4444'; textColor = '#991b1b'; }
        else if ('🎯🔥🚀📅'.includes(emoji)) { bg = '#fff7ed'; border = '#f97316'; textColor = '#9a3412'; }
        else if ('📱📋'.includes(emoji)) { bg = '#f5f3ff'; border = '#8b5cf6'; textColor = '#5b21b6'; }
        else { bg = '#f8fafc'; border = '#94a3b8'; textColor = '#334155'; }
        elements.push(
          <div key={`highlight-${i}`} style={{background: bg, border: `2px solid ${border}`, borderRadius: '10px', padding: '12px 16px', margin: '12px 0', color: textColor, fontSize: '14px', lineHeight: '1.7'}}>
            <span style={{fontSize: '18px', marginRight: '8px'}}>{emoji}</span>
            {styleInline(rest)}
          </div>
        );
        continue;
      }

      // ── Checklist items (☐) ──
      if (/^☐\s/.test(trimmed)) {
        flushBullets();
        const content = trimmed.replace(/^☐\s*/, '');
        elements.push(
          <div key={`check-${i}`} style={{display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '4px 0', padding: '6px 12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #22c55e'}}>
            <span style={{fontSize: '16px', flexShrink: 0, marginTop: '1px'}}>☐</span>
            <span style={{color: '#334155', lineHeight: '1.6', fontSize: '13.5px'}}>{styleInline(content)}</span>
          </div>
        );
        continue;
      }

      // ── Bullet points (▸, •, -, *, 🔧, 🔸, 🔹, numbered 1. 2. 3.) ──
      if (/^\s*([•▸▪️●🔸🔹🔧✅✓☑️→➤➜⬥◆◇])\s/.test(trimmed) || /^\s*[\-\*]\s/.test(trimmed) || /^\s*\d+[\.\)]\s/.test(trimmed)) {
        const isNumbered = /^\s*\d+[\.\)]/.test(trimmed);
        const num = isNumbered ? trimmed.match(/^\s*(\d+)/)?.[1] : null;
        const cleanLine = trimmed.replace(/^\s*[•▸▪️●🔸🔹🔧✅✓☑️→➤➜⬥◆◇]\s*/, '').replace(/^\s*[\-\*]\s*/, '').replace(/^\s*\d+[\.\)]\s*/, '');
        bulletItems.push(
          <div key={`bullet-${i}`} style={{display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '4px 0', padding: '7px 12px', background: 'rgba(59, 130, 246, 0.04)', borderRadius: '8px', borderLeft: '3px solid #3b82f6'}}>
            <span style={{flexShrink: 0, minWidth: '20px', textAlign: 'center', marginTop: '1px'}}>
              {num ? <span style={{background: '#3b82f6', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800}}>{num}</span> : <span style={{color: '#f59e0b', fontWeight: 800, fontSize: '14px'}}>▸</span>}
            </span>
            <span style={{color: '#334155', lineHeight: '1.6'}}>{styleInline(cleanLine)}</span>
          </div>
        );
        continue;
      }

      // ── Image carousel labels (📱 Image 1:, 🔍 Image 2:, etc.) ──
      if (/^(📱|🔍|🛠️|✨|✅|📸)\s*(Image|Slide|Photo|Frame)\s*\d/i.test(trimmed)) {
        flushBullets();
        elements.push(
          <div key={`img-${i}`} style={{display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '6px 0', padding: '10px 14px', background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)', borderRadius: '10px', border: '1px solid #bfdbfe'}}>
            <span style={{fontSize: '18px', flexShrink: 0}}>{[...trimmed][0]}</span>
            <span style={{color: '#1e40af', fontWeight: 600, lineHeight: '1.6'}}>{styleInline(trimmed.substring([...trimmed][0].length))}</span>
          </div>
        );
        continue;
      }

      // ── Hashtag lines ──
      if (/^#\w/.test(trimmed) && (trimmed.match(/#/g) || []).length >= 2) {
        flushBullets();
        elements.push(
          <div key={`hash-${i}`} style={{color: '#2563eb', fontWeight: 600, fontSize: '13px', margin: '10px 0', background: '#eff6ff', display: 'inline-block', padding: '4px 12px', borderRadius: '20px'}}>
            {trimmed}
          </div>
        );
        continue;
      }

      // ── P.S. lines ──
      if (/^P\.?S\.?\s*[—\-–:]/i.test(trimmed)) {
        flushBullets();
        elements.push(
          <div key={`ps-${i}`} style={{fontStyle: 'italic', color: '#475569', margin: '12px 0', padding: '10px 16px', borderLeft: '3px solid #94a3b8', background: '#f8fafc', borderRadius: '0 8px 8px 0', fontSize: '13.5px', lineHeight: '1.7'}}>
            {styleInline(trimmed)}
          </div>
        );
        continue;
      }

      // ── Signature / sign-off lines (Stay warm, Best regards, etc.) ──
      if (/^(Stay\s+\w+|Best\s+\w+|Warm\s+\w+|Sincerely|Regards|Thanks|Thank\s+you|Cheers)\s*,?$/i.test(trimmed)) {
        flushBullets();
        elements.push(
          <div key={`signoff-${i}`} style={{color: '#475569', fontStyle: 'italic', margin: '8px 0 2px 0', fontSize: '14px'}}>
            {trimmed}
          </div>
        );
        continue;
      }

      // ── Placeholder lines [Your Name], [Business Name], [PHONE] etc. ──
      if (/^\[.*\]$/.test(trimmed)) {
        flushBullets();
        elements.push(
          <div key={`placeholder-${i}`} style={{color: '#9333ea', fontWeight: 600, fontSize: '13px', fontStyle: 'italic', margin: '2px 0'}}>
            {trimmed}
          </div>
        );
        continue;
      }

      // ── ALL-CAPS SECTION LABELS (SUCCESS METRICS TO TRACK:, CAMPAIGN PERFORMANCE TARGETS, etc.) ──
      if (/^[A-Z][A-Z\s&\/\-]{5,}:?\s*$/.test(trimmed.replace(/[^\w\s:&\/\-]/g, '').trim()) && trimmed.length < 60 && trimmed.length > 5) {
        flushBullets();
        elements.push(
          <div key={`capsheader-${i}`} style={{background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: '2px solid #cbd5e1', borderLeft: '5px solid #f59e0b', borderRadius: '10px', padding: '12px 18px', margin: '22px 0 10px 0', fontWeight: 800, fontSize: '14px', color: '#1e293b', letterSpacing: '0.5px', textTransform: 'uppercase'}}>
            {trimmed.replace(/\*\*/g, '')}
          </div>
        );
        continue;
      }

      // ── Completion / Success banners (ALL 6 CAMPAIGN PIECES COMPLETE ✅, etc.) ──
      if (/^(ALL|COMPLETE|CAMPAIGN|READY|DONE|FINISHED|SUCCESS)\s/i.test(trimmed) && /(✅|COMPLETE|READY|DONE|DEPLOY)/i.test(trimmed)) {
        flushBullets();
        elements.push(
          <div key={`banner-${i}`} style={{background: 'linear-gradient(135deg, #065f46, #047857)', color: 'white', padding: '16px 22px', borderRadius: '12px', margin: '24px 0 12px 0', fontWeight: 900, fontSize: '15px', letterSpacing: '0.5px', textAlign: 'center', boxShadow: '0 3px 10px rgba(0,0,0,0.15)', border: '2px solid #34d399'}}>
            {trimmed}
          </div>
        );
        continue;
      }

      // ── Character count / metadata lines ──
      if (/^(Character\s*count|Word\s*count|Char\s*count)\s*:/i.test(trimmed)) {
        flushBullets();
        elements.push(
          <div key={`charcount-${i}`} style={{color: '#94a3b8', fontSize: '11px', fontStyle: 'italic', margin: '2px 0 8px 0', paddingLeft: '4px'}}>
            {trimmed}
          </div>
        );
        continue;
      }

      // ── Option 1 / Option 2 / Choice lines ──
      if (/^Option\s*\d\s*:/i.test(trimmed)) {
        flushBullets();
        const colonIdx = trimmed.indexOf(':');
        const label = trimmed.substring(0, colonIdx + 1);
        const rest = trimmed.substring(colonIdx + 1).trim();
        elements.push(
          <div key={`option-${i}`} style={{display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '6px 0', padding: '10px 14px', background: '#fefce8', borderRadius: '10px', border: '2px solid #fbbf24', borderLeft: '5px solid #f59e0b'}}>
            <span style={{fontWeight: 900, color: '#92400e', fontSize: '13px', flexShrink: 0}}>{label}</span>
            <span style={{color: '#451a03', lineHeight: '1.6'}}>{styleInline(rest)}</span>
          </div>
        );
        continue;
      }

      // ── Regular text lines ──
      flushBullets();
      elements.push(
        <div key={`line-${i}`} style={{margin: '3px 0', color: '#1e293b', lineHeight: '1.75', fontSize: '14px'}}>
          {styleInline(trimmed)}
        </div>
      );
    }

    flushBullets();
    return <>{elements}</>;
  };

  // Load library from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('marketingContentLibrary');
    if (saved) {
      try {
        setContentLibrary(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load library:', e);
      }
    }
  }, []);

  // Save library to localStorage whenever it changes
  React.useEffect(() => {
    if (contentLibrary.length > 0) {
      localStorage.setItem('marketingContentLibrary', JSON.stringify(contentLibrary));
    }
  }, [contentLibrary]);

  // Business types and target markets
  const businessTypes = [
    'Appliance Repair', 'Auto Detailing', 'Carpet & Upholstery Cleaning',
    'Chimney Services', 'Commercial Cleaning', 'Concrete', 'Deck Building',
    'Drywall Repair', 'Electrical', 'Fencing', 'Flooring/Tile',
    'Foundation Repair', 'Garage Door Repair', 'Gutter Cleaning',
    'Handyman', 'HVAC', 'Junk Removal', 'Landscaping', 'Lawn Care',
    'Locksmith', 'Moving', 'Painting', 'Pest Control', 'Plumbing',
    'Pool', 'Pressure Washing', 'Residential Cleaning', 'Restoration',
    'Roofing', 'Security Systems', 'Septic/Sewer Services', 'Siding',
    'Tree Care', 'Waterproofing', 'Window Washing'
  ];

  const targetMarkets = ['Residential', 'Commercial', 'Both'];

  // Test API Connection
  const testAPIConnection = async () => {
    setApiTestResult('Testing API connection...');
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 100,
          messages: [{ role: "user", content: "Reply with just the word SUCCESS" }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setApiTestResult(`❌ API TEST FAILED\nStatus: ${response.status}\nError: ${errorData.error?.message || 'Unknown error'}\n\nThis means the API is not accessible from this artifact.`);
        return;
      }

      const data = await response.json();
      const result = data.content[0].text;
      setApiTestResult(`✅ API TEST SUCCESSFUL!\n\nResponse received: "${result}"\n\nThe API is working. If generate buttons don't work, it's a form/UI issue, not API.`);
    } catch (err) {
      setApiTestResult(`❌ API TEST FAILED\n\nError: ${err.message}\n\nThis usually means:\n- Network is blocked\n- CORS issue\n- Browser security blocking the request`);
    }
  };

  // API Call Function
  const callClaudeAPI = async (prompt, maxTokens = 4000, images = []) => {
    setLoading(true);
    setError('');
    setOutput('');
    setStatusMessage('🔵 Starting API call...');

    try {
      setStatusMessage(images.length > 0 ? '📤 Uploading photos + sending request to Anthropic API...' : '📤 Sending request to Anthropic API...');

      // Build message content - if images provided, use multi-content format
      let messageContent;
      if (images.length > 0) {
        messageContent = [
          ...images.map(img => ({
            type: "image",
            source: { type: "base64", media_type: img.mediaType, data: img.data }
          })),
          { type: "text", text: prompt }
        ];
      } else {
        messageContent = prompt;
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: maxTokens,
          messages: [{ role: "user", content: messageContent }]
        })
      });

      setStatusMessage(`📡 Response received (Status: ${response.status})...`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = `API Request Failed\n\nStatus Code: ${response.status}\nError Message: ${errorData.error?.message || 'Unknown error'}\n\nThis typically means:\n- Rate limit exceeded (wait a minute)\n- Authentication issue\n- Server error (try again)`;
        setError(errorMsg);
        setLoading(false);
        setStatusMessage('');
        throw new Error(errorMsg);
      }

      setStatusMessage('🔄 Processing response data...');
      const data = await response.json();

      if (!data.content || !data.content[0] || !data.content[0].text) {
        const errorMsg = 'Invalid API Response\n\nThe API returned data in an unexpected format. This is unusual and may indicate a temporary API issue.';
        setError(errorMsg);
        setLoading(false);
        setStatusMessage('');
        throw new Error(errorMsg);
      }

      const result = data.content[0].text;
      setStatusMessage(`✅ Success! Generated ${result.length} characters of content`);
      setOutput(result);
      setLoading(false);

      // Clear status after 2 seconds
      setTimeout(() => setStatusMessage(''), 2000);

      return result;

    } catch (err) {
      const errorMsg = err.message || 'Unknown error occurred during API call';
      setError(errorMsg);
      setLoading(false);
      setStatusMessage('');
      throw err;
    }
  };

  // Copy to Clipboard
  // Convert text to Unicode bold (renders as bold on Facebook, Nextdoor, Instagram, etc.)
  const toUnicodeBold = (str) => {
    const boldMap = {};
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const boldUpper = '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭';
    const boldLower = '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇';
    const boldDigits = '𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵';
    for (let i = 0; i < 26; i++) { boldMap[upper[i]] = [...boldUpper][i]; boldMap[lower[i]] = [...boldLower][i]; }
    for (let i = 0; i < 10; i++) { boldMap[digits[i]] = [...boldDigits][i]; }
    return [...str].map(c => boldMap[c] || c).join('');
  };

  // Format output for clipboard — post-ready with Unicode bold, clean dividers, etc.
  const formatForClipboard = (text) => {
    if (!text) return text;
    let formatted = text;

    // Convert **bold** markers to Unicode bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, (_, inner) => toUnicodeBold(inner));

    // Convert markdown ### headers to Unicode bold (process ### before ## before #)
    formatted = formatted.replace(/^###\s+(.+)$/gm, (_, content) => `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${toUnicodeBold(content)}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    formatted = formatted.replace(/^##\s+(.+)$/gm, (_, content) => `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${toUnicodeBold(content)}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    formatted = formatted.replace(/^#\s+(.+)$/gm, (_, content) => `\n═══════════════════════════════════════════\n${toUnicodeBold(content)}\n═══════════════════════════════════════════`);

    // Bold the PIECE headers (if not already caught by ### above)
    formatted = formatted.replace(/^((?:.*?)PIECE\s*#?\d.*)$/gm, (match) => {
      if (match.includes('━') || match.includes('═')) return match; // already formatted
      return `\n${'═'.repeat(40)}\n${toUnicodeBold(match)}\n${'═'.repeat(40)}`;
    });

    // Bold the DAY/POST/EMAIL/TEXT sub-headers (if not already caught)
    formatted = formatted.replace(/^((?:.*?\s)?(?:DAY|POST|EMAIL|TEXT|WEEK|SCRIPT)\s*#?\d.*)$/gim, (match) => {
      if (match.includes('━') || match.includes('═')) return match;
      return `\n${'━'.repeat(35)}\n${toUnicodeBold(match)}\n${'━'.repeat(35)}`;
    });

    // Bold field labels (Subject Line:, Body:, Title:, etc.)
    formatted = formatted.replace(/^(Subject\s*Line|Preview\s*Text|Title|Hook|CTA|Body|Description|Offer|Format|Tone)\s*:/gim, (match) => toUnicodeBold(match));

    // Bold section labels (HEADLINE:, CONTACT INFO:, etc.)
    formatted = formatted.replace(/^(HEADLINE|SUBHEADLINE|CONTACT\s*INFO|FOOTER|DESIGN\s*NOTES|SUCCESS\s*METRICS|CAMPAIGN\s*PERFORMANCE)\s*:?/gim, (match) => toUnicodeBold(match));

    // Clean up any excessive blank lines (more than 2 in a row)
    formatted = formatted.replace(/\n{4,}/g, '\n\n\n');

    return formatted;
  };

  const copyToClipboard = () => {
    if (!output) {
      alert('⚠️ No content to copy!');
      return;
    }

    const postReady = formatForClipboard(output);

    navigator.clipboard.writeText(postReady).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch((err) => {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = postReady;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        alert('❌ Failed to copy. Please select and copy manually.');
      }
      document.body.removeChild(textArea);
    });
  };

  // Module Generators
  const generateWeekContent = async () => {
    setStatusMessage('📝 Button clicked! Reading form data...');

    try {
      // Get form values directly
      const businessType = document.getElementById('wc_business_type')?.value || '';
      const targetMarket = document.getElementById('wc_target_market')?.value || '';
      const address = document.getElementById('wc_address')?.value || '';
      const service = document.getElementById('wc_service')?.value || '';
      const work = document.getElementById('wc_work')?.value || '';
      const neighborhood = document.getElementById('wc_neighborhood')?.value || '';

      if (!businessType || !targetMarket || !address || !service || !work || !neighborhood) {
        setError('Please fill in all required fields!');
        setStatusMessage('');
        return;
      }

      setStatusMessage('✅ Form data collected! Building prompt...');

      // Dynamic audience language based on target market
      const audienceTerms = targetMarket === 'Commercial'
        ? 'business owners, facility managers, property managers'
        : targetMarket === 'Residential'
        ? 'homeowners, property owners, residents'
        : 'homeowners and business owners';

      const focusTerms = targetMarket === 'Commercial'
        ? 'business continuity, liability reduction, compliance, downtime costs, ROI'
        : targetMarket === 'Residential'
        ? 'family safety, property value protection, home comfort, peace of mind'
        : 'property protection, safety, and value';

      const prompt = `You are a $5,000/mo agency Creative Director specializing in hyper-local service business content.

JOB COMPLETED:
Business Type: ${businessType}
Target Market: ${targetMarket}
Address: ${address}
Service: ${service}
Work Done: ${work}
Area: ${neighborhood}

TARGET AUDIENCE: ${audienceTerms}
MESSAGING FOCUS: ${focusTerms}

FORBIDDEN WORDS: unlock, harness, elevate, comprehensive, game-changer, "proud to serve"

IMPORTANT: Use the "Service/Job Type" field as the primary job identity throughout all content. The "Business Type" is the industry category — do NOT use it as a job title (e.g., don't say "appliance repair technicians" if the service is "AC Repair" — reference the actual service performed).

CONTENT VARIATION STRATEGY:
To keep content fresh even with similar jobs, rotate through these angles:
- COST ANGLE: Financial impact, ROI, money saved, cost avoidance
- SAFETY ANGLE: Risk prevention, protection, peace of mind
- TECHNICAL ANGLE: Methodology, equipment, diagnostic process, expertise
- SEASONAL ANGLE: Timing-specific threats, weather impacts, prevention
- AUTHORITY ANGLE: Industry data, certifications, case studies, proven track record

IMPORTANT: Use different hooks, vary sentence structure, use fresh examples and metaphors. Even if the job details are similar, make each piece feel unique by changing the emphasis and wording.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate 7 days of revenue-driving content from this ONE job. Each piece targets different platforms and angles.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 DAY 1 - MONDAY | 💡 EDUCATIONAL TIP
Platform: Facebook & Nextdoor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Title: "⚠️ 3 Warning Signs of ${service} Issues That ${neighborhood} ${targetMarket === 'Commercial' ? 'Business Owners' : 'Homeowners'} Miss"
Format: Educational, helpful (not salesy)
Hook: Common problem that just got solved in their area
Body: 3 warning signs with explanations (use emoji bullets: 🔸 for each sign)
Include: How this job showed these signs
CTA: "Free assessment if you see these signs"
Word count: 300-350

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 DAY 2 - TUESDAY | 📊 CASE STUDY BLOG
Platform: Website
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Title: "📍 ${address}: How We Prevented a $[X] ${service} Disaster"
Framework: Problem → Our approach → Results → Cost avoided
Hook: Financial impact or severity
Body: Technical details, methodology, timeline for ${businessType} service
Include: Specific measurements, equipment used
Result: ${targetMarket === 'Commercial' ? 'Business operations protected, downtime avoided' : 'Property value protected, family safety ensured'}, cost savings
Word count: 600-800
SEO optimized for ${businessType} in ${neighborhood}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 DAY 3 - WEDNESDAY | 📸 FACEBOOK CAROUSEL POST
Platform: Facebook
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create 5-image carousel captions for Facebook:
📱 Image 1: Before - problem identified
🔍 Image 2: Close-up - severity shown
🛠️ Image 3: Process - our ${businessType} methodology
✨ Image 4: After - transformation
✅ Image 5: Results - metrics + CTA
Each caption: 20-30 words
Include: Hashtags for ${neighborhood} and ${businessType}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 DAY 4 - THURSDAY | 🏘️ NEIGHBORHOOD HERO STORY
Platform: Facebook
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hook: "Just helped a ${targetMarket === 'Commercial' ? 'local business' : 'neighbor'} on ${address.split(',')[0]}"
Body: Community-focused story (not technical)
Tone: Local, relatable, trustworthy
Include: Problem solved, happy ${targetMarket === 'Commercial' ? 'business owner' : 'homeowner'}
CTA: "We're local and ready to help you too"
Word count: 150-200

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 DAY 5 - FRIDAY | 📍 GOOGLE BUSINESS POST
Platform: Google Business Profile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Format: Short, local SEO optimized
Hook: Recent ${businessType} job completion announcement
Body: Service provided, neighborhood, quick outcome
Include: ${businessType} keywords, ${neighborhood} location terms, ${targetMarket} focus
CTA: Call or book
Word count: 100-150
Platform: Google Business Profile

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 DAY 6 - SATURDAY | 🏘️ NEXTDOOR UPDATE
Platform: Nextdoor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hook: "🏡 In your area: ${neighborhood}"
Body: What we just completed, why ${targetMarket === 'Commercial' ? 'local businesses' : 'neighbors'} should know
Tone: Helpful neighbor, not salesy
Include: Preventative tips related to ${businessType} and this ${service} job
CTA: "DM me if you have questions"
Word count: 150-200

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 DAY 7 - SUNDAY | ⭐ YELP UPDATE POST
Platform: Yelp Business Update
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Format: Yelp business update post
Hook: Recent ${businessType} completion in ${neighborhood}
Body: Brief overview of ${service} provided, outcome, value delivered to ${targetMarket === 'Commercial' ? 'local business' : 'homeowner'}
Tone: Professional, credible, community-focused
Include: Location mention, service keywords for ${businessType}
CTA: "Contact us for similar ${service} needs"
Word count: 100-150

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OUTPUT FORMAT:
Label each day clearly (DAY 1, DAY 2, etc.)
Include platform in header
Ready to copy/paste
No cheerful AI language
Dollar amounts in every piece where relevant
Technical credibility throughout for ${businessType} industry
Include 3-5 relevant hashtags at the end of Facebook and Nextdoor pieces
Adapt tone for ${targetMarket} audience: ${targetMarket === 'Commercial' ? 'Professional, ROI-focused, business continuity emphasis' : targetMarket === 'Residential' ? 'Relatable, safety-focused, property value emphasis' : 'Balanced approach for both audiences'}

CRITICAL — ENGAGEMENT QUESTION ON EVERY POST:
End every single post (all 7 days) with a conversational "Engagement Question" that invites comments from neighbors. This is NOT a CTA (don't say "call us") — it's a comment trigger that sparks conversation in the first hour.
Examples: "Have you ever noticed this in your home?" | "What would you check first?" | "Anyone else dealing with this after last week's storm?" | "What's the worst you've seen?"
Label it clearly: 💬 Engagement Question: [question]
Make each day's question different and relevant to that day's angle.

BONUS — APPLE SHOWCASE TIP:
After the Day 7 output, add a brief note:
🍎 APPLE SHOWCASE TIP: Repurpose Day 5's GBP post as an Apple Business Connect Showcase — upload the same job photo with a short caption. This puts you on every CarPlay dashboard in your zip code.

📲 WHERE TO POST EACH PIECE:
After the Apple Showcase Tip, include this exact deployment guide:

📲 HOW TO DEPLOY YOUR 7 DAYS OF CONTENT:
▸ Facebook posts (Days 1, 3, 4, 7) — Post from your Business Page (not your personal profile). To schedule ahead: go to Meta Business Suite (free) → Create Post → select date/time → Schedule. Load all 4 posts in one sitting.
▸ Google Business Profile (Day 5) — Go to business.google.com → click "Add update" → paste your post. Important: Google does NOT support bold, bullets, or any formatting. Plain text and emojis only.
▸ Nextdoor (Days 1, 6) — Post in your local neighborhood groups. Keep the conversational tone — Nextdoor flags overly promotional content. Post manually; Nextdoor doesn't support scheduling tools.
▸ Yelp (Day 7) — Log into biz.yelp.com → Business Updates → paste your post. Short and professional.
▸ Website/Blog (Day 2) — Paste into your website blog or news page. If you don't have a blog, post as a Facebook Note or save for your next website update.
▸ Want to schedule everything at once? Buffer (free plan) handles Facebook, Instagram, and Google Business. Load a full week in 15 minutes on Monday morning.

Do NOT cross-post the same content across platforms — each day's post is written in the native tone of its platform. That's what makes this work.`;

      await callClaudeAPI(prompt, 5500);
    } catch (err) {
      setError(`Form Submission Error: ${err.message}`);
      setStatusMessage('');
    }
  };

  const generateJobPipeline = async () => {
    setStatusMessage('📝 Collecting job data...');

    try {
      const businessType = document.getElementById('jp_business_type')?.value || '';
      const targetMarket = document.getElementById('jp_target_market')?.value || '';
      const address = document.getElementById('jp_address')?.value || '';
      const service = document.getElementById('jp_service')?.value || '';
      const work = document.getElementById('jp_work')?.value || '';
      const customer = document.getElementById('jp_customer')?.value || '';
      const customerEmail = document.getElementById('jp_email')?.value || '';

      if (!businessType || !targetMarket || !address || !service || !work || !customer) {
        setError('Please fill in all required fields!');
        setStatusMessage('');
        return;
      }

      const audienceTerm = targetMarket === 'Commercial' ? 'business owners' : targetMarket === 'Residential' ? 'homeowners' : 'property owners';

      const prompt = `You are a $5,000/mo agency Creative Director. Generate 3 revenue-driving assets from this completed job.

JOB DATA:
Business Type: ${businessType}
Target Market: ${targetMarket}
Location: ${address}
Service: ${service}
Work: ${work}
Customer: ${customer}
${customerEmail ? `Customer Email: ${customerEmail}` : ''}

AUDIENCE: ${audienceTerm}
FOCUS: ${targetMarket === 'Commercial' ? 'Business continuity, ROI, liability reduction, compliance' : targetMarket === 'Residential' ? 'Property value, family safety, home comfort, peace of mind' : 'Property protection and value'}

FORBIDDEN: unlock, harness, elevate, comprehensive, "proud to serve"

IMPORTANT: Use the "Service" field as the primary job identity throughout all content. The "Business Type" is the industry category — do NOT use it as a job title (e.g., don't say "appliance repair technicians" if the service is "Pipe replacement" — say "plumbing technicians" or reference the actual service performed).

CONTENT VARIATION STRATEGY:
Rotate through these angles for fresh content each time:
- COST ANGLE: Dollar savings, ROI percentage, budget protection
- TECHNICAL ANGLE: Equipment used, diagnostic methods, industry standards
- URGENCY ANGLE: Time-sensitive risks, escalation costs, quick action benefits
- PROOF ANGLE: Customer testimonials, before/after metrics, success rates
- PREVENTION ANGLE: Ongoing protection, maintenance plans, future cost avoidance

Vary your hooks, use different examples, change sentence structure to keep content fresh.

OUTPUT FORMATTING RULES:
- Use emojis strategically for visual interest (💡 🎯 ⚡ 💰 🔥 📊 ⚠️ ✅ 📱 🏠 etc.)
- Add line breaks between sections for readability
- Use visual separators like ━━━ between different days or pieces
- For lists, use emoji bullets instead of plain bullets
- Make headers stand out with emojis
- Keep it scannable - busy business owners need to skim quickly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PIECE #1: SEO CASE STUDY (Blog/Website)
Word Count: 400-500 words
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Framework: A.I.D.A.
Title: "📍 ${address}: How We Prevented a $[X] ${service} Failure"

Use this structure with emojis to break up sections:
⚠️ [ATTENTION] Market data or failure rate stat for ${businessType}
🔍 [INTEREST] Problem: What ${audienceTerm.slice(0, -1)} saw vs diagnostic revealed, projected failure cost
🛠️ [DESIRE] Our approach: ${businessType} methodology, diagnostic report details, scope of work
✅ [ACTION] Results: ${targetMarket === 'Commercial' ? 'Business operations protected, downtime avoided' : 'Property value protected'}, cost avoidance %, ${targetMarket === 'Commercial' ? 'business continuity maintained' : 'family safety ensured'}

Include: Local SEO keywords for ${businessType}, technical jargon, specific measurements

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 PIECE #2: SOCIAL MEDIA POSTS (3 platform-specific versions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create 3 DIFFERENT versions of this job post — one for each platform. Do NOT copy-paste the same content. Each must be written in the native tone of its platform.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📘 POST 2A — FACEBOOK
Platform: Facebook Business Page
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tone: Data-driven professional storytelling
Word Count: 150-200 words
Hook: Cost differential or problem severity (use 💰 for dollar amounts)
Body: Job completed, outcome, technical credibility for ${businessType}
Include: Specific dollar amounts, performance metrics
Use emojis for: ✅ completion, 💰 savings, ⚡ urgency, 🏠 property
CTA: Direct - "Schedule diagnostic assessment"
Hashtags: 3-5 relevant hashtags (e.g., #${businessType.replace(/\s+/g, '')} #${targetMarket} #[City])

CRITICAL — ENGAGEMENT QUESTION:
End with a comment trigger (NOT a CTA).
Label it: 💬 Engagement Question: [question]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏘️ POST 2B — NEXTDOOR
Platform: Nextdoor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tone: Helpful neighbor sharing what just happened on the job — NOT a business ad
Word Count: 120-170 words
Open like a neighbor: "Hey neighbors" or "Just wrapped up a job in [neighborhood]"
Body: Tell the story conversationally — what you found, why it mattered, what you did. Focus on helping the community, not selling.
CTA: Soft — "If you're ever dealing with something similar, happy to take a look" or "DM me if you have questions"
No hashtags (Nextdoor doesn't use them well)
DO NOT sound like a Facebook ad. Lead with helpfulness.

CRITICAL — ENGAGEMENT QUESTION:
End with a neighborly question.
Label it: 💬 [question]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 POST 2C — GOOGLE BUSINESS PROFILE
Platform: Google Business Profile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tone: Professional, concise, SEO-optimized
Word Count: 80-120 words
CRITICAL: PLAIN TEXT ONLY. No markdown. No **bold**. No bullets. No numbered lists. Google does NOT render formatting.
Body: What service was performed, location, outcome, your availability
Include: ${businessType} keywords, city name twice for local SEO
CTA: Natural sentence leading to a call or booking
No hashtags. No emojis. Clean professional text.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 PIECE #3: REVIEW REQUEST EMAIL
To: ${customer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${customerEmail ? `📧 SEND TO: ${customerEmail}` : '📧 SEND TO: [Enter customer email]'}

Subject: ${customer}, your feedback + VIP benefits

Opening: "${customer} - thank you for choosing [Company] for your ${businessType} ${service}."

Request: "Would you share your experience? A review on Google or Facebook helps other ${audienceTerm}."
Links: [Google Review Link] [Facebook Review Link]

🎁 VIP incentive program:
💰 $50 cash per referred customer who books
💵 $50 off your next service
⚡ Priority emergency response
🔧 Annual complimentary inspection

Referral: "Just have them mention your name when they call."
Close: "Your ${service} is completed to specification. Direct line: [Number]"

NO flowery language. Transactional but professional.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OUTPUT: Cost focus, technical jargon for ${businessType}, forbidden words zero, ROI positioning.

📲 WHERE TO POST EACH PIECE:
After all pieces, include this deployment guide:
▸ Piece 1 (Case Study) — Paste into your website blog. No blog? Post as a long-form Facebook post or save as a Google Doc for later.
▸ Post 2A (Facebook) — Post from your Facebook Business Page with a job photo. Schedule using Meta Business Suite if you want to batch posts.
▸ Post 2B (Nextdoor) — Post in your neighborhood groups. Post manually — Nextdoor doesn't support scheduling tools. Keep the neighborly tone.
▸ Post 2C (Google Business) — Go to business.google.com → click "Add update" → paste your post. Add a job photo. Plain text only — no formatting. Posts expire after 7 days, so repost weekly.
▸ Piece 3 (Review Email) — Send within 2 hours of completing the job while the experience is fresh. Use Gmail, Mailchimp, or just text the customer the Google review link directly.
▸ Do NOT cross-post the same content across platforms. Each version above is written in the native tone of its platform.`;

      await callClaudeAPI(prompt, 3000);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatusMessage('');
    }
  };

  const generateCalendar = async () => {
    setStatusMessage('📝 Creating calendar...');

    try {
      const businessType = document.getElementById('cal_business_type')?.value || '';
      const targetMarket = document.getElementById('cal_target_market')?.value || '';
      const month = document.getElementById('cal_month')?.value || '';
      const city = document.getElementById('cal_city')?.value || '';
      const focus = document.getElementById('cal_focus')?.value || '';

      if (!businessType || !targetMarket || !month || !city) {
        setError('Please fill in required fields!');
        setStatusMessage('');
        return;
      }

      const audienceTerm = targetMarket === 'Commercial' ? 'businesses and facilities' : targetMarket === 'Residential' ? 'homeowners' : 'property owners';

      const prompt = `You are a $5,000/mo marketing strategist creating a 30-day content calendar that aligns with an existing weekly Roadmap.

PARAMETERS:
Business Type: ${businessType}
Target Market: ${targetMarket}
Month: ${month}
Location: ${city}
Content Focus: ${focus || 'General ' + businessType + ' services'}

AUDIENCE: ${audienceTerm}
MESSAGING: ${targetMarket === 'Commercial' ? 'Business continuity, compliance, ROI, downtime prevention' : targetMarket === 'Residential' ? 'Home safety, property value, family comfort, preventive care' : 'Property protection and value'}

FORBIDDEN: unlock, harness, elevate, comprehensive, game-changer, "proud to serve"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL — WEEKLY PLATFORM SCHEDULE (follow this exactly):
The user follows a weekly Roadmap. Each day has assigned platforms. Generate content that matches:

- MONDAY (Content Creation Day): TWO hooks — one for 📍 GBP Post (SEO-optimized, 100 words) + one for 📘 Facebook Post (educational/story, 200 words)
- TUESDAY (Video + Nextdoor Day): TWO hooks — one for 🏘️ Nextdoor Tip (helpful neighbor tone, 150 words) + one 🎬 Video Topic (30-second script concept)
- WEDNESDAY (Visual Proof Day): TWO hooks — one for 📸 Yelp Update (professional, 100 words) + one for 📍 GBP Photo Caption (geotagged photo idea)
- THURSDAY (Authority Day): ONE hook — 📝 Blog Post/FAQ Topic (SEO long-form, 300+ words when expanded) with 3-4 talking points
- FRIDAY (Reviews + Social Proof Day): ONE hook — 📘 Facebook Social Proof Post (review showcase or community story, 150 words)

WEEKDAYS ONLY — no Saturday/Sunday posts.

For each day, provide:
- Day number, day of week, and platform(s)
- Post type (Educational Tip / Case Study / Testimonial / Alert / Direct Offer)
- Content hook (compelling headline specific to ${businessType})
- 3-4 key talking points tailored to ${targetMarket} market
- CTA (specific, actionable — not generic "call us")
- 💬 Engagement Question (conversational comment trigger, NOT a CTA)

Include seasonal relevance for ${month} in ${city} climate and market conditions.
Make content specific to ${businessType} industry and ${targetMarket} needs.
Include 3-5 relevant hashtags on Facebook and Nextdoor posts.

IMPORTANT: Case study posts may use fabricated names for examples. Use realistic but clearly fictional names. Add a note at the top: "⚠️ Change all names and addresses to your real job details before posting."

Mix: 40% educational tips, 30% case studies, 20% social proof, 10% direct offers

Make it actionable — business owner should grab the hook and expand it into a full post using their other tools.

OUTPUT: Calendar format, week-by-week, no fluff, tactical content briefs for ${businessType} targeting ${audienceTerm}. 4 weeks + partial Week 5 if the month has extra days.`;

      await callClaudeAPI(prompt, 4500);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatusMessage('');
    }
  };

  const generateWeatherAlert = async () => {
    setStatusMessage('📝 Creating weather alert...');

    try {
      const businessType = document.getElementById('wa_business_type')?.value || '';
      const targetMarket = document.getElementById('wa_target_market')?.value || '';
      const weather = document.getElementById('wa_weather')?.value || '';
      const threat = document.getElementById('wa_threat')?.value || '';
      const city = document.getElementById('wa_city')?.value || '';
      const when = document.getElementById('wa_when')?.value || '';

      if (!businessType || !targetMarket || !weather || !threat || !city) {
        setError('Please fill in required fields!');
        setStatusMessage('');
        return;
      }

      const audienceTerm = targetMarket === 'Commercial' ? 'business owners and facility managers' : targetMarket === 'Residential' ? 'homeowners' : 'property owners';

      const prompt = `You are a $5,000/mo direct response copywriter. Create platform-specific weather alert posts for a local ${businessType} business.

BUSINESS: ${businessType}
TARGET: ${targetMarket}
WEATHER: ${weather}
THREAT: ${threat}
LOCATION: ${city}
TIMING: ${when || 'Soon'}

AUDIENCE: ${audienceTerm}
FOCUS: ${targetMarket === 'Commercial' ? 'Business operations, employee safety, property damage costs, insurance implications' : targetMarket === 'Residential' ? 'Family safety, home protection, property value, preventive measures' : 'Property and people protection'}

FORBIDDEN: Stay safe, be prepared, comprehensive, unlock, harness, elevate, "proud to serve"

LOCAL SEO: Mention ${city} by name at least twice per post. Reference local landmarks, neighborhoods, or known weather patterns if contextually relevant.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create 3 PLATFORM-SPECIFIC weather alert posts. Each must be written in the NATIVE TONE of its platform — do NOT copy-paste the same content across platforms.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ POST 1 — FACEBOOK
Platform: Facebook Business Page
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tone: Professional authority with data-driven urgency
Length: 200-250 words
Structure:
- Hook: Weather threat + cost if ignored (specific to ${businessType} in ${city})
- Body: Specific risks (${targetMarket === 'Commercial' ? 'business operations, liability, employee safety' : 'property damage, family safety, home value'})
- Prevention steps: 3-4 tactical actions ${audienceTerm} can take related to ${businessType}
- CTA: Emergency contact info
- Hashtags: 3-5 relevant hashtags (e.g., #${city.replace(/[^a-zA-Z]/g, '')}Storm #${businessType.replace(/\s+/g, '')} #WeatherAlert)
Use strategic emojis (⚠️ 🔧 📞 💰) but keep it professional.

CRITICAL — ENGAGEMENT QUESTION:
End with a conversational comment trigger (NOT a CTA).
Label it: 💬 Engagement Question: [question]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏘️ POST 2 — NEXTDOOR
Platform: Nextdoor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tone: Helpful neighbor giving a heads-up — NOT a business ad. Conversational, first-person, like you're talking to people on your street.
Length: 150-200 words
Structure:
- Open like a neighbor: "Hey neighbors" or "Quick heads-up for ${city} homeowners"
- Share the weather threat in plain language
- Give 2-3 genuinely helpful prevention tips (not self-serving — things they can actually do themselves)
- THEN mention your business naturally: "If you do need help with [specific issue], we're around — just call [PHONE]"
- No hashtags (Nextdoor doesn't use them effectively)
DO NOT sound like a business ad. Nextdoor flags promotional content. Lead with helpfulness, mention your business last.

CRITICAL — ENGAGEMENT QUESTION:
End with a neighborly question.
Label it: 💬 [question]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 POST 3 — GOOGLE BUSINESS PROFILE
Platform: Google Business Profile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tone: Professional, concise, SEO-optimized
Length: 80-120 words
CRITICAL FORMATTING: PLAIN TEXT ONLY. No markdown. No **bold**. No *italics*. No bullet points. No numbered lists. Google Business does NOT render formatting — it shows as literal characters.
Structure:
- One sentence about the weather threat in ${city}
- What ${audienceTerm} should watch for related to ${businessType}
- Your availability and response time
- Natural CTA sentence (no placeholder phone numbers)
- Mention "${city}" twice for local SEO
No hashtags. No emojis. Clean professional text only.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📲 WHERE TO POST EACH PIECE:
After all 3 posts, include this deployment guide:
▸ Post 1 (Facebook) — Post from your Business Page immediately. Weather posts get 3-5x more reach than regular posts because people share them. If it gets traction in the first hour, boost it for $2-3/day to maximize reach (see the Seasonal Campaign Builder for step-by-step boost instructions).
▸ Post 2 (Nextdoor) — Post in your neighborhood groups. Weather alerts perform best on Nextdoor because neighbors share and comment. Post manually — Nextdoor doesn't support scheduling tools.
▸ Post 3 (Google Business) — Go to business.google.com → click "Add update" → paste your post. Add a relevant photo if you have one. Plain text only.
▸ Timing matters: Post BEFORE the weather event hits, not during or after. Be the first business people think of when the storm arrives.

Do NOT cross-post the same content across platforms. Each post above is written in the native tone of its platform — that's what makes it work.`;

      await callClaudeAPI(prompt, 2500);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatusMessage('');
    }
  };

  const generateBeforeAfter = async () => {
    setStatusMessage('📝 Creating transformation story...');

    try {
      const businessType = document.getElementById('ba_business_type')?.value || '';
      const targetMarket = document.getElementById('ba_target_market')?.value || '';
      const type = document.getElementById('ba_type')?.value || '';
      const description = document.getElementById('ba_description')?.value || '';
      const location = document.getElementById('ba_location')?.value || '';
      const fileInput = document.getElementById('ba_images');
      const files = fileInput?.files || [];

      if (!businessType || !targetMarket || !type || !location) {
        setError('Please fill in all required fields!');
        setStatusMessage('');
        return;
      }

      // Process uploaded images into base64
      const images = [];
      if (files.length > 0) {
        setStatusMessage(`📷 Processing ${files.length} photo${files.length > 1 ? 's' : ''}...`);
        for (let i = 0; i < Math.min(files.length, 5); i++) {
          const file = files[i];
          const mediaType = file.type || 'image/jpeg';
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = () => reject(new Error('Failed to read photo'));
            reader.readAsDataURL(file);
          });
          images.push({ data: base64, mediaType });
        }
      }

      const hasPhotos = images.length > 0;
      const audienceTerm = targetMarket === 'Commercial' ? 'business' : targetMarket === 'Residential' ? 'homeowner' : 'property owner';

      const prompt = `You are a $5,000/mo agency creative creating before/after content for a ${businessType} business.

${hasPhotos ? `PHOTOS ATTACHED: ${images.length} job photo${images.length > 1 ? 's' : ''} uploaded. ANALYZE THESE PHOTOS CAREFULLY and describe exactly what you see — real materials, real colors, real conditions, real details from the images. Do NOT fabricate details that contradict what's visible in the photos. Use the photos as your primary source of truth and supplement with the text description below.` : `NO PHOTOS PROVIDED. Use the transformation description below to fabricate realistic, specific details (materials, colors, conditions, measurements). Make it sound like you were on the job site.`}

BUSINESS: ${businessType}
TARGET: ${targetMarket}
JOB: ${type}
${description ? `TRANSFORMATION DESCRIPTION: ${description}` : ''}
LOCATION: ${location}

AUDIENCE: ${audienceTerm}s
MESSAGING: ${targetMarket === 'Commercial' ? 'ROI, operational efficiency, professional results' : targetMarket === 'Residential' ? 'Property value, visual impact, quality of life improvement' : 'Property enhancement and value'}

FORBIDDEN: amazing, incredible, stunning, "proud to", unlock, harness, elevate, comprehensive

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create 4 pieces:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 PIECE #1: FACEBOOK/BLOG STORY
Platform: Facebook Business Page / Website Blog
Word Count: 300-400 words
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Structure:
💰 Hook: Cost differential or severity
⚠️ Before: Problem scope, measurements, projected cost${hasPhotos ? ' — REFERENCE WHAT IS VISIBLE IN THE PHOTOS' : ''}
🛠️ Process: ${businessType} technical approach, equipment, timeline
✨ After: Results, cost avoided, ${targetMarket === 'Commercial' ? 'business value protected' : 'property value protected'}${hasPhotos ? ' — REFERENCE THE COMPLETED RESULTS VISIBLE IN PHOTOS' : ''}
📞 CTA: Assessment offer for ${businessType} services in ${location}

Use emojis to break up sections and make it scannable!

CRITICAL — ENGAGEMENT QUESTION:
After the CTA, add a conversational comment trigger on its own line.
Label it: 💬 [question]
Examples: "Has anyone else dealt with this in ${location}?" | "What would you check first in your home?" | "Have you been putting off a project like this?"

Hashtags: Include 3-5 relevant hashtags at the end (e.g., #${businessType.replace(/\s+/g, '')} #${location.replace(/\s+/g, '')} #BeforeAndAfter #HomeImprovement)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 PIECE #2: MULTI-IMAGE CAROUSEL POST
Platforms: Facebook, Google Business Profile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Slide 1:** ⚠️ BEFORE - problem identified (caption 20-30 words)${hasPhotos ? ' — describe what the before photo shows' : ''}
**Slide 2:** 🔍 CLOSE-UP - damage extent (caption 20-30 words)
**Slide 3:** 🛠️ PROCESS - ${businessType} methodology (caption 20-30 words)
**Slide 4:** ✨ AFTER - completion metrics (caption 20-30 words)${hasPhotos ? ' — describe what the after photo shows' : ''}
**Slide 5:** ✅ RESULTS - cost savings + CTA + hashtags (caption 20-30 words)

Tone: Technical professional, data-driven for ${targetMarket} audience
Include: Dollar amounts, performance metrics, timeline
Hashtags: Include 3-5 relevant hashtags at the end of Slide 5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏘️ PIECE #3: NEXTDOOR NEIGHBORHOOD POST
Platform: Nextdoor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tone: Helpful neighbor sharing a local job — NOT an advertisement
Word Count: 120-170 words
Open like a neighbor: "Hey neighbors" or "Just finished a project in ${location}" or "Thought I'd share this with the neighborhood"
Body: Tell the before/after story conversationally — what the problem was, what you found, how it turned out. Focus on being helpful, not selling.${hasPhotos ? ' Reference what the photos show in a natural way.' : ''}
Include: A helpful tip related to ${type} that any ${audienceTerm} can use
CTA: Soft — "If anyone's dealing with something similar, happy to take a look" or "DM me if you have questions"
No hashtags (Nextdoor doesn't use them effectively)
DO NOT sound like a Facebook ad. Nextdoor flags promotional content.

CRITICAL — ENGAGEMENT QUESTION:
End with a neighborly question.
Label it: 💬 [question]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️ PIECE #4: SEO IMAGE ALT-TEXT
For: Facebook, Google Business Profile, Apple Business Connect, Website
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate alt-text for 5 images matching the carousel slides above.
Each alt-text must:
- Be under 125 characters
- Include the trade/service type ("${type}")
- Include the city/neighborhood ("${location}")
- Mention specific technical equipment or materials when relevant
- Describe what's visible in the image for AI image recognition
${hasPhotos ? '- BASE DESCRIPTIONS ON WHAT IS ACTUALLY VISIBLE IN THE UPLOADED PHOTOS' : ''}

Format:
**Image 1 (Before):** [alt-text]
**Image 2 (Close-Up):** [alt-text]
**Image 3 (Process):** [alt-text]
**Image 4 (After):** [alt-text]
**Image 5 (Results):** [alt-text]

OUTPUT: Story first, then carousel captions (clearly labeled **Slide 1**, **Slide 2**, etc.), then Nextdoor post, then alt-text (clearly labeled **Image 1**, **Image 2**, etc.).

📲 WHERE TO POST EACH PIECE:
After all 4 pieces, include this deployment guide:
▸ Piece 1 (Facebook/Blog Story) — Post to your Facebook Business Page with your best before/after photo. Also works as a blog post on your website.
▸ Piece 2 (Carousel Post) — Facebook: Create a post and upload multiple photos in order. Google Business: Go to business.google.com → Photos → upload before/after photos with the captions as descriptions.
▸ Piece 3 (Nextdoor Post) — Post in your neighborhood groups. Keep the conversational tone — Nextdoor flags overly promotional content. Post manually; Nextdoor doesn't support scheduling.
▸ Piece 4 (SEO Alt-Text) — When uploading photos anywhere (website, Google Business, Facebook), paste the alt-text into the image description or alt-text field. This helps Google find your photos in search results.
▸ Pro tip: Upload your best job photos to Google Business Profile under the "Photos" tab — these show up in Google Maps and local search results. Add the alt-text as the photo description.
▸ Do NOT cross-post the same content across platforms. Each piece is written in the native tone of its platform.`;

      await callClaudeAPI(prompt, 4000, images);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatusMessage('');
    }
  };

  const generateVideoScript = async () => {
    setStatusMessage('🎬 Generating up to 8 video scripts...');

    try {
      const businessType = document.getElementById('vs_business_type')?.value || '';
      const targetMarket = document.getElementById('vs_target_market')?.value || '';
      const jobDetails = document.getElementById('vs_job_details')?.value || '';
      const customerName = document.getElementById('vs_customer_name')?.value || '';
      const city = document.getElementById('vs_city')?.value || '';
      const media = document.getElementById('vs_media')?.value || '';

      if (!businessType || !targetMarket || !jobDetails || !city) {
        setError('Please fill in all required fields!');
        setStatusMessage('');
        return;
      }

      const audienceTerm = targetMarket === 'Commercial' ? 'business decision-makers' : targetMarket === 'Residential' ? 'homeowners' : 'property owners';
      const hasMedia = media === 'yes';

      const prompt = `You are a $5,000/mo video scriptwriter creating MULTIPLE ready-to-film scripts for ${businessType} businesses.

BUSINESS: ${businessType}
TARGET: ${targetMarket} ${audienceTerm}
JOB COMPLETED: ${jobDetails}
${customerName ? `CUSTOMER: ${customerName}` : ''}
LOCATION: ${city}
MEDIA AVAILABLE: ${hasMedia ? 'Yes - has before/after photos/videos' : 'No - will film everything fresh'}

FORBIDDEN WORDS: amazing, incredible, game-changer, blessed, excited, unlock, harness, elevate, comprehensive, "proud to serve"

CONTENT VARIATION STRATEGY:
Rotate through these angles across different scripts:
- DRAMA/URGENCY: Time pressure, emergency response, disaster averted
- EXPERTISE/DIAGNOSTIC: Technical knowledge, what others missed, superior skill
- CUSTOMER RELIEF: Savings, avoiding expensive alternatives, honest service
- TRANSFORMATION: Before/after visual impact, dramatic improvement
- EDUCATION: Teaching ${audienceTerm} prevention, maintenance, warning signs

OUTPUT FORMATTING RULES:
- Use emojis strategically (🎬 📱 ⚡ 💡 🔥 ⏱️ 📸 etc.)
- Add visual separators ━━━ between different scripts
- Label each script clearly
- Include second-by-second timing
- Specify exact visual shots needed
- Provide exact on-screen text wording

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create 8 COMPLETE video scripts from this ONE job:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 SCRIPT #1: BEFORE/AFTER SHOWCASE (60 seconds)
Platform: Facebook Video
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**HOOK (0:00-0:05):**
Visual: ${hasMedia ? 'Show before photo/video' : 'Film damaged/problematic area'}
Text Overlay: [Create shocking/attention-grabbing text about the problem]
Voiceover: [Hook line that stops scroll]

**PROBLEM (0:05-0:20):**
Visual: ${hasMedia ? 'Close-ups of before damage' : 'Film problem details, measurements'}
Text Overlay: [Specific problem details, cost implications]
Voiceover: [Explain severity, what was at stake for ${audienceTerm}]

**SOLUTION (0:20-0:40):**
Visual: ${hasMedia ? 'Show work in progress if available' : 'Film yourself explaining or showing tools/process'}
Text Overlay: [What you did, timeline, expertise demonstrated]
Voiceover: [Explain ${businessType} solution, why it worked]

**RESULT (0:40-0:55):**
Visual: ${hasMedia ? 'Show after photo/video' : 'Film finished result, happy customer if possible'}
Text Overlay: [Outcome, money saved, problem solved]
Voiceover: [Results for ${audienceTerm}, transformation achieved]

**CTA (0:55-1:00):**
Visual: Your logo or face to camera
Text Overlay: "Same problem? Call [Business Name]" or "Book free assessment"
Voiceover: [Direct call-to-action]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 SCRIPT #2: NEIGHBORHOOD ANNOUNCEMENT (30 seconds)
Platform: Nextdoor, Facebook
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**HOOK (0:00-0:05):**
Visual: Film yourself on location (outside the property if allowed)
Text Overlay: "Just completed [service] in ${city}"
Voiceover: [Friendly local introduction, mention ${city}]

**WHAT WE DID (0:05-0:15):**
Visual: ${hasMedia ? 'Quick before/after' : 'Show your truck/van, tools, or yourself working'}
Text Overlay: [Brief job description]
Voiceover: [What the ${audienceTerm} needed, what you provided]

**COMMUNITY VALUE (0:15-0:25):**
Visual: Neighborhood shot or happy customer (if they agreed)
Text Overlay: "Serving ${city} since [Year]"
Voiceover: [Local expertise, community connection]

**CTA (0:25-0:30):**
Visual: Your contact info on screen
Text Overlay: "Need ${businessType}? We're right here in ${city}"
Voiceover: [Quick call-to-action for neighbors]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SCRIPT #3: CASE STUDY BREAKDOWN (60 seconds)
Platform: Facebook, Google Business Profile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**INTRO (0:00-0:10):**
Visual: Face to camera or walking toward property
Text Overlay: "Case Study: How we [main result achieved]"
Voiceover: [Set up the challenge, stakes for ${audienceTerm}]

**DIAGNOSIS (0:10-0:25):**
Visual: ${hasMedia ? 'Problem area footage' : 'Film yourself explaining with diagrams or pointing'}
Text Overlay: [Technical findings, what made this tricky]
Voiceover: [Your ${businessType} expertise, diagnostic process]

**APPROACH (0:25-0:45):**
Visual: ${hasMedia ? 'Work in progress' : 'Film tools/equipment you used'}
Text Overlay: [Your solution, why this approach vs others]
Voiceover: [Explain methodology, why it works for ${targetMarket}]

**OUTCOME (0:45-0:55):**
Visual: ${hasMedia ? 'Final result' : 'Film completed work'}
Text Overlay: [Quantifiable result - money saved, time saved, problem eliminated]
Voiceover: [Customer benefit, ROI for ${audienceTerm}]

**CTA (0:55-1:00):**
Visual: Contact info
Text Overlay: "Similar ${businessType} challenge? Let's talk."
Voiceover: [Invitation to reach out]

${customerName ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ SCRIPT #4: TESTIMONIAL REQUEST GUIDE (How to ask ${customerName})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**WHEN TO ASK:** Right after job completion while ${customerName} is happiest

**WHAT TO SAY:**
"${customerName}, I'm so glad we could help with [service]. Would you be willing to do a quick 30-second video testimonial? Just pull out your phone and tell me:
1. What problem you had
2. Why you chose us
3. How it turned out
Super casual, doesn't need to be perfect!"

**IF THEY SAY YES - GUIDE THEM:**

**Question 1 (10 seconds):** "What problem were you dealing with before you called us?"
→ They describe: [the problem from job details]

**Question 2 (10 seconds):** "What made you choose [Business Name] for this ${businessType} work?"
→ They mention: [speed, expertise, price, reviews, referral]

**Question 3 (10 seconds):** "How did everything turn out?"
→ They describe: [relief, quality, would recommend]

**FILMING TIPS FOR CUSTOMER:**
- Film vertical (portrait mode)
- Stand in good lighting (facing window or outside)
- Hold phone at eye level
- Speak naturally, pretend talking to a friend
- Total 30-60 seconds is perfect

**WHAT YOU DO WITH IT:**
- Thank them profusly
- Edit in CapCut: Add text overlay with their name and the service
- Post everywhere with caption: "This is why we do what we do 💙"
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 SCRIPT #5: EDUCATIONAL TIPS (45 seconds)
Platform: Facebook
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**HOOK (0:00-0:05):**
Visual: Face to camera with intriguing question
Text Overlay: "3 signs you need [service related to this job]"
Voiceover: [Hook that creates curiosity for ${audienceTerm}]

**TIP #1 (0:05-0:15):**
Visual: Point to example or demonstrate
Text Overlay: "Sign #1: [Warning sign from this job type]"
Voiceover: [Explain what to look for, why it matters]

**TIP #2 (0:15-0:25):**
Visual: Show another example
Text Overlay: "Sign #2: [Second warning sign]"
Voiceover: [Explain implications for ${targetMarket}]

**TIP #3 (0:25-0:35):**
Visual: Final example or demonstration
Text Overlay: "Sign #3: [Third warning sign]"
Voiceover: [Explain when to call professional]

**CTA (0:35-0:45):**
Visual: Face to camera
Text Overlay: "See these signs? Call [Business Name]"
Voiceover: [Offer free inspection or assessment]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏘️ SCRIPT #6: BEHIND-THE-SCENES PROCESS (45 seconds)
Platform: Facebook, Nextdoor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**INTRO (0:00-0:08):**
Visual: Film your truck arriving or walking up to property
Text Overlay: "Day in the life: ${businessType} call"
Voiceover: [Quick setup of the job]

**STEP 1 (0:08-0:18):**
Visual: Film yourself doing first step of process
Text Overlay: "Step 1: [What you're doing]"
Voiceover: [Explain this step, why it's important]

**STEP 2 (0:18-0:28):**
Visual: Film second major step
Text Overlay: "Step 2: [Next phase]"
Voiceover: [Show expertise, explain approach]

**STEP 3 (0:28-0:38):**
Visual: Film completion or quality check
Text Overlay: "Step 3: [Final step/quality check]"
Voiceover: [Professionalism, attention to detail]

**WRAP (0:38-0:45):**
Visual: ${hasMedia ? 'Quick before/after comparison' : 'Face to camera with completed work'}
Text Overlay: "Another happy ${targetMarket === 'Commercial' ? 'client' : 'homeowner'} ✓"
Voiceover: [Brief satisfaction note, CTA]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📢 SCRIPT #7: QUICK WIN/FUN FACT (15-30 seconds)
Platform: Facebook
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**HOOK (0:00-0:03):**
Visual: Face to camera with surprised/excited expression
Text Overlay: "You won't believe what we found today..."
Voiceover: [Create intrigue]

**THE REVEAL (0:03-0:20):**
Visual: ${hasMedia ? 'Show the interesting/shocking element' : 'Demonstrate or explain'}
Text Overlay: [The surprising fact or finding from this job]
Voiceover: [Explain what made this noteworthy, educational angle]

**LESSON (0:20-0:27):**
Visual: Face to camera
Text Overlay: "This is why you should [prevention tip]"
Voiceover: [Practical takeaway for ${audienceTerm}]

**CTA (0:27-0:30):**
Visual: Quick logo/contact
Text Overlay: "Questions? Call us!"
Voiceover: [Ultra-brief CTA]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ SCRIPT #8: THE 3-SECOND PATTERN INTERRUPT (15-20 seconds)
Platform: Facebook Reels, Instagram Reels, TikTok
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose: Ultra-short video designed to stop the scroll in under 1.5 seconds. Viewers decide instantly — this format is built for maximum algorithmic reach.

**THE INTERRUPT (0:00-0:03):**
Visual: EXTREME close-up of the most dramatic element — damaged component, tool in action, shocking discovery, or reading on a diagnostic instrument
Text Overlay: ONE bold statement (5 words max) — create shock or curiosity. Examples: "This could have killed someone." / "Your [item] is lying to you." / "$12,000 hiding in your walls."
Audio: NO intro, NO greeting. Start mid-action. The first sound should be dramatic — equipment running, something cracking, or you mid-sentence.

**THE REVEAL (0:03-0:12):**
Visual: Pull back to show full context — face to camera explaining what you found on THIS job
Text Overlay: 1-2 lines explaining the problem (specific to ${businessType} and this ${jobDetails || 'job'})
Voiceover: Quick, punchy explanation. Use numbers — cost, danger level, how common this is. Speak to ${audienceTerm} directly.

**THE HOOK-OUT (0:12-0:18):**
Visual: Face to camera, confident
Text Overlay: "Follow for more [trade] tips" + your business name
Voiceover: "If you see this in your [home/building], call a pro today. Follow for more."

KEY RULES FOR THIS SCRIPT:
- First frame must be visually ARRESTING — no logos, no intros, no "Hey guys"
- Entire video must feel like the viewer walked in mid-conversation
- This script should make the viewer say "Wait, WHAT?" in the first second
- Keep total length under 20 seconds for maximum replay rate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FINAL OUTPUT: Up to 8 complete, production-ready scripts. Each script is fully detailed with exact timing, visual directions, text overlays, and voiceover copy tailored for ${targetMarket} ${audienceTerm}.

LOCAL SEO: Mention "${city}" by name in at least 3 scripts — especially the Neighborhood Announcement (#2) and Case Study (#3). Reference local context when relevant.

CRITICAL — VIDEO CAPTION COPY:
After each script, include a ready-to-paste "📱 POST CAPTION" (2-3 sentences + hashtags) that accompanies the video when posted. End each caption with:
💬 [Engagement question that invites comments — NOT a CTA, a conversation starter]
Examples: "Anyone else seen this in ${city}?" | "What would you check first?" | "Tag a neighbor who needs to see this"

Hashtags: Include 3-5 relevant hashtags in each caption (e.g., #${city.replace(/[^a-zA-Z]/g, '')} #${businessType.replace(/\\s+/g, '')} #HomeRepair #BeforeAndAfter)

📲 HOW TO POST YOUR VIDEOS:
After all 8 scripts, include this deployment guide:
▸ Facebook Videos (Scripts 1, 3, 4, 6, 7) — Upload from your Business Page. Under 3 minutes for feed posts. Use Meta Business Suite to schedule ahead of time.
▸ Facebook/Instagram Reels (Scripts 5, 8) — Must be vertical (9:16 ratio). Film with your phone held upright. Upload through the Instagram app or Meta Business Suite. Under 90 seconds for maximum reach.
▸ Nextdoor (Script 2) — Upload video directly to your Nextdoor post. Keep it casual and neighborly — don't make it feel like an ad.
▸ TikTok (Scripts 5, 8) — Download the TikTok app → tap the + button → upload your video → add captions and hashtags → post. Vertical format only.
▸ Google Business Profile (Script 3) — Go to business.google.com → Photos → upload as a video. GBP supports short videos that appear on your business listing.
▸ Filming tip: Use your phone, natural lighting, and speak directly to camera. Authentic beats polished every time for local service businesses.`;

      await callClaudeAPI(prompt, 7000);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatusMessage('');
    }
  };

  const generateGMBPost = async () => {
    setStatusMessage('📝 Creating Google Business post...');

    try {
      const businessType = document.getElementById('gmb_business_type')?.value || '';
      const targetMarket = document.getElementById('gmb_target_market')?.value || '';
      const city = document.getElementById('gmb_city')?.value || '';
      const type = document.getElementById('gmb_type')?.value || '';
      const service = document.getElementById('gmb_service')?.value || '';
      const details = document.getElementById('gmb_details')?.value || '';
      const landmark = document.getElementById('gmb_landmark')?.value || '';
      const environmental = document.getElementById('gmb_environmental')?.value || '';
      const cta = document.getElementById('gmb_cta')?.value || '';

      if (!businessType || !targetMarket || !city || !type || !cta) {
        setError('Please fill in all required fields!');
        setStatusMessage('');
        return;
      }

      const audienceTerm = targetMarket === 'Commercial' ? 'businesses' : targetMarket === 'Residential' ? 'homeowners' : 'property owners';

      const prompt = `You are a $5,000/mo local SEO specialist creating a Google Business Profile post.

BUSINESS: ${businessType}
TARGET: ${targetMarket}
CITY: ${city}
TYPE: ${type}
SERVICE: ${service || businessType + ' services'}
DETAILS: ${details || 'General ' + businessType + ' work'}
${landmark ? `NEARBY LANDMARK: ${landmark}` : ''}
${environmental ? `ENVIRONMENTAL FACTOR: ${environmental}` : ''}
CTA BUTTON: ${cta}

AUDIENCE: ${audienceTerm}
FOCUS: ${targetMarket === 'Commercial' ? 'Commercial reliability, business solutions, professional service' : targetMarket === 'Residential' ? 'Home services, property care, customer satisfaction' : 'Quality service for all properties'}

FORBIDDEN: proud to serve, comprehensive, amazing, incredible, unlock, harness, elevate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL FORMATTING RULES — GOOGLE BUSINESS POSTS:
- PLAIN TEXT ONLY. No markdown. No **bold**. No *italics*. No bullet points (•). No numbered lists.
- Google Business does NOT render markdown — asterisks and bullets show as literal characters.
- Write in natural paragraphs. Use line breaks between paragraphs for readability.
- Keep total length 100-150 words (Google truncates longer posts in search preview).
- Do NOT include hashtags — Google Business is not social media, hashtags look unprofessional and add no SEO value here.
- Do NOT write "Call [NUMBER]" or any placeholder text. End with a natural CTA sentence that leads into the "${cta}" button Google will display below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create ONE Google Business post (100-150 words):

Structure:
- Hook: Immediate value proposition for ${audienceTerm} in ${city}
- Body: Specific details, technical credibility, local relevance for ${targetMarket} market
- Mention "${city}" by name at least twice for local SEO
${landmark ? `- Location Anchor: Naturally mention "${landmark}" to create a geographic anchor (e.g., "Just completed a job near ${landmark}" or "Serving the ${landmark} area")` : ''}
${environmental ? `- Environmental Context: Weave in "${environmental}" as the reason this service matters here specifically` : ''}
- Benefit: ${targetMarket === 'Commercial' ? 'Business continuity, liability reduction, cost efficiency' : 'Cost avoidance, problem prevention, property value protection'}
- CTA: One sentence that leads naturally into the "${cta}" button

SEO optimization:
- Include: ${businessType} keywords, "${city}" location terms, problem/solution keywords
${landmark ? `- Include the landmark name naturally for geographic relevance` : ''}
${environmental ? `- Include the environmental factor to show local expertise` : ''}
- Natural language (not keyword stuffing)
- Local authority positioning

OUTPUT: Plain text post, ready to paste directly into Google Business Profile. No formatting marks of any kind.

📲 HOW TO POST THIS TO GOOGLE BUSINESS:
After the post content, include these exact steps:
1. Go to business.google.com and sign in with your Google account
2. Select your business if you have more than one
3. Click "Add update" (or "Posts" in the left menu on desktop)
4. Choose your post type: "${cta === 'Book' ? 'Offer' : cta === 'Call now' ? 'What\\'s new' : 'What\\'s new'}"
5. Paste your post into the description field
6. Add a photo from the job if you have one (posts with photos get 2x more views)
7. Select the "${cta}" button at the bottom
8. Click "Publish"
Your post will appear on your Google Business listing within minutes. Posts stay visible for 7 days, so repost weekly for maximum visibility.`;

      await callClaudeAPI(prompt, 1500);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatusMessage('');
    }
  };

  const generateCompetitorIntel = async () => {
    setStatusMessage('📝 Analyzing competitor...');

    try {
      const businessType = document.getElementById('ci_business_type')?.value || '';
      const targetMarket = document.getElementById('ci_target_market')?.value || '';
      const ad = document.getElementById('ci_ad')?.value || '';
      const advantages = document.getElementById('ci_advantages')?.value || '';
      const city = document.getElementById('ci_city')?.value || '';

      if (!businessType || !targetMarket || !ad || !advantages || !city) {
        setError('Please fill in all required fields!');
        setStatusMessage('');
        return;
      }

      const audienceTerm = targetMarket === 'Commercial' ? 'businesses and facilities' : targetMarket === 'Residential' ? 'homeowners' : 'property owners';

      const prompt = `You are a $5,000/mo competitive analyst and copywriter.

BUSINESS: ${businessType}
TARGET: ${targetMarket}
COMPETITOR'S AD:
${ad}

YOUR ADVANTAGES:
${advantages}

MARKET: ${city}
AUDIENCE: ${audienceTerm}

FORBIDDEN: elevate, comprehensive, revolutionize, unlock, harness, incredible, amazing, "proud to serve"

IMPORTANT: If the user's advantages are vague, say "not sure," or are minimal — still complete the full analysis. In Part 2, use the GAPS you identified in Part 1 to suggest realistic competitive advantages that any ${businessType} business could claim (faster response, transparent pricing, better warranties, etc.) and flag them as "SUGGESTED — verify these apply to your business."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Provide 3-part analysis:

PART 1: COMPETITIVE ANALYSIS
What's working in their ad:
- Hook effectiveness for ${businessType} and ${targetMarket}
- Value proposition
- CTA strength
- Psychological triggers

What's missing or weak:
- Credibility gaps
- Vague claims
- Generic messaging
- Missed opportunities for ${targetMarket} market

PART 2: IMPROVED VERSION
Rewrite the ad highlighting YOUR advantages for ${businessType}:
- Sharper hook (${targetMarket === 'Commercial' ? 'ROI focus or business impact' : 'cost focus or problem severity'})
- Specific differentiators (${advantages})
- Technical credibility for ${businessType}
- Stronger CTA for ${targetMarket} audience
- Mention "${city}" for local relevance

Use their structure but execute better. Make it data-driven, specific to ${businessType}, and differentiated for ${audienceTerm}.

PART 3: WHAT TO DO NEXT
After the improved ad, add a brief "WHAT TO DO WITH THIS" section:
- Where to use the improved ad copy (Google Business post, Facebook post, website, paid ads)
- Which specific suite tools to run it through next (Google Business Post Optimizer for a Google-ready version, One Job = One Week for platform-specific posts)
- When to rerun this analysis (monthly on Saturday Deep-Dive day per the Roadmap)

OUTPUT: Analysis first, then your improved ad copy, then action steps.`;

      await callClaudeAPI(prompt, 3000);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatusMessage('');
    }
  };

  const generateReviewMax = async () => {
    setStatusMessage('📝 Creating review assets...');

    try {
      const businessType = document.getElementById('rm_business_type')?.value || '';
      const targetMarket = document.getElementById('rm_target_market')?.value || '';
      const review = document.getElementById('rm_review')?.value || '';
      const customer = document.getElementById('rm_customer')?.value || '';
      const customerEmail = document.getElementById('rm_email')?.value || '';
      const service = document.getElementById('rm_service')?.value || '';
      const city = document.getElementById('rm_city')?.value || '';

      if (!businessType || !targetMarket || !review || !customer || !service || !city) {
        setError('Please fill in all required fields!');
        setStatusMessage('');
        return;
      }

      const audienceTerm = targetMarket === 'Commercial' ? 'business clients' : targetMarket === 'Residential' ? 'homeowners' : 'customers';

      const prompt = `You are a $5,000/mo marketing strategist maximizing review value.

BUSINESS: ${businessType}
TARGET: ${targetMarket}
REVIEW: ${review}
CUSTOMER: ${customer}
SERVICE: ${service}
CITY: ${city}

AUDIENCE: ${audienceTerm}

FORBIDDEN: amazing, incredible, blessed, "proud to", "proud to serve", unlock, harness, elevate, comprehensive

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create 4 marketing assets:

ASSET #1: SOCIAL MEDIA POST (150-200 words)
- Hook: ${customer}'s name + ${businessType} service type + "${city}"
- Quote: Best 1-2 sentences from review (in quotes)
- Context: What problem was solved, outcome achieved for ${targetMarket} client
- Mention "${city}" at least once for local relevance
- Hashtags: Include 3-5 relevant hashtags for ${businessType} (include #${city.replace(/[^a-zA-Z]/g, '')})
- End with: 💬 [Engagement question that invites comments — NOT a CTA. Examples: "What's the one room in your house that needs the most attention?" or "Anyone else put off a project like this for too long?"]
Platform: Facebook or Nextdoor

ASSET #2: REFERRAL REQUEST EMAIL
${customerEmail ? `📧 SEND TO: ${customerEmail}` : '📧 SEND TO: [Enter customer email]'}
Subject: ${customer}, thank you + referral opportunity

Body:
- Appreciation (brief) for choosing ${businessType} services
- Referral incentive: $50 cash per booking
- How it works: "Have them mention your name when they call"
- Additional benefits: Priority service, annual inspection
- Direct contact line

Tone: Transactional professional, no fluff

ASSET #3: GOOGLE BUSINESS UPDATE
Brief customer success story for Google Business Profile.
- ${businessType} service completed in ${city}
- Problem solved (specific to ${targetMarket})
- Outcome (measurable)
- Mention "${city}" at least twice for local SEO
- 100-150 words, SEO optimized for ${businessType}

CRITICAL FOR ASSET #3: PLAIN TEXT ONLY. No **bold**, no *italics*, no bullet points, no markdown of any kind. Google Business does NOT render markdown — asterisks show as literal characters. Write in natural paragraphs.

ASSET #4: KEYWORD-RICH REVIEW REPLY
This is your PUBLIC REPLY to the customer's review on Google/Yelp/Facebook.
Purpose: Stuff SEO keywords into your response so the review + reply combo ranks higher.

Format:
- Thank ${customer} by name
- Mention the SPECIFIC SERVICE ("${service}") naturally
- Mention "${city}" or a neighborhood naturally
- Include ONE technical detail that signals expertise (equipment, methodology, certification)
- End with a subtle CTA for other readers: "If any ${city} neighbors need [service], we're always a call away."

Length: 75-100 words
Tone: Warm, professional, grateful — NOT robotic or keyword-stuffed sounding
Rules:
- Must read like a real human wrote it
- Keywords should flow naturally in sentences, not be crammed in
- Do NOT say "We are proud to" or "We are blessed"

Example structure: "Thank you [Name]! We're glad the [specific service] at your ${city} [home/business] went smoothly. [Technical detail about the job]. If any ${city} neighbors need [service type], we're always happy to help."

OUTPUT: All 4 assets, labeled clearly, post-ready for ${targetMarket} audience.`;

      await callClaudeAPI(prompt, 3000);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatusMessage('');
    }
  };

  const generateDailyTip = async () => {
    setStatusMessage('💡 Creating expert tips...');

    try {
      const businessType = document.getElementById('dt_business_type')?.value || '';
      const city = document.getElementById('dt_city')?.value || '';
      const tipCategory = document.getElementById('dt_category')?.value || '';
      const tone = document.getElementById('dt_tone')?.value || '';
      const numTips = document.getElementById('dt_number')?.value || '1';

      if (!businessType || !city || !tipCategory || !tone) {
        setError('Please fill in all required fields!');
        setStatusMessage('');
        return;
      }

      // Scale tokens based on tip count
      const tokenMap = { '1': 1500, '5': 3000, '10': 4500, '30': 7000 };
      const maxTokens = tokenMap[numTips] || 3000;

      const prompt = `You are a content strategist for home services businesses.

BUSINESS: ${businessType}
CITY: ${city}
TIP CATEGORY: ${tipCategory}
TONE: ${tone}
NUMBER OF TIPS: ${numTips}

FORBIDDEN: amazing, incredible, blessed, "proud to serve", unlock, harness, elevate, comprehensive, game-changer

Generate ${numTips} expert tip(s) for ${businessType} in the ${tipCategory} category with a ${tone} tone.

For EACH tip, use this structure:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 TIP [NUMBER]: [CATCHY TITLE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[THE TIP - 2-3 sentences, specific and actionable]

[WHY IT MATTERS - 1 sentence with specific benefit/cost/stat]

💬 [Engagement question — NOT a CTA. A conversation starter that invites comments. Examples: "What's the oldest appliance still running in your house?" or "Anyone else put off this until it was too late?"]

#Hashtag1 #Hashtag2 #Hashtag3 #${city.replace(/[^a-zA-Z]/g, '')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUIREMENTS:
- Include specific numbers (costs, timeframes, percentages)
- Make it actionable (clear what to DO)
- Keep each tip 50-100 words
- Add 3-5 relevant hashtags per tip (always include a ${city} hashtag)
- Use emojis strategically
- Mention "${city}" or local context naturally in at least every other tip for local SEO
- Write for Facebook Business Page, Nextdoor, and Google Business Profile
- Every tip MUST end with an engagement question (💬) — this is critical for algorithm reach

Generate ${numTips} tip(s) now.`;

      await callClaudeAPI(prompt, maxTokens);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatusMessage('');
    }
  };

  const generateEmailCampaign = async () => {
    setStatusMessage('📧 Building email campaign...');

    try {
      const businessType = document.getElementById('ec_business_type')?.value || '';
      const targetMarket = document.getElementById('ec_target_market')?.value || '';
      const campaignType = document.getElementById('ec_campaign_type')?.value || '';
      const timeframe = document.getElementById('ec_timeframe')?.value || '';
      const city = document.getElementById('ec_city')?.value || '';
      const offer = document.getElementById('ec_offer')?.value || '';

      if (!businessType || !targetMarket || !campaignType || !timeframe || !city) {
        setError('Please fill in all required fields!');
        setStatusMessage('');
        return;
      }

      const audienceTerm = targetMarket === 'Commercial' ? 'business clients' : targetMarket === 'Residential' ? 'homeowners' : 'customers';

      const prompt = `You are a $5,000/mo email marketing strategist for home services.

BUSINESS: ${businessType}
TARGET: ${targetMarket} ${audienceTerm}
CAMPAIGN TYPE: ${campaignType}
TIMEFRAME: ${timeframe}
CITY: ${city}
${offer ? `OFFER/FOCUS: ${offer}` : ''}

FORBIDDEN WORDS: amazing, incredible, blessed, excited, thrilled, proud to announce, unlock, harness, elevate, comprehensive, game-changer

CONTENT VARIATION STRATEGY:
Rotate through these approaches for fresh content:
- VALUE ANGLE: Cost savings, ROI, preventive maintenance value
- URGENCY ANGLE: Seasonal timing, limited availability, weather-driven needs
- EDUCATION ANGLE: How-to tips, industry insights, problem prevention
- SOCIAL PROOF ANGLE: Customer stories, before/after, testimonials
- EXPERTISE ANGLE: Technical knowledge, certifications, diagnostic capability

OUTPUT FORMATTING RULES:
- Use emojis strategically for visual interest (💡 🎯 ⚡ 💰 🔥 📊 ⚠️ ✅ 📱 🏠 💼 🛠️ etc.)
- Add line breaks between sections for readability
- Use visual separators like ━━━ between different emails
- For lists, use emoji bullets instead of plain bullets
- Make headers stand out with emojis
- Keep it scannable - busy business owners need to skim quickly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create complete email sequence based on campaign type:

${campaignType === 'Newsletter' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL 1: MONTHLY NEWSLETTER
Subject Line: [Month] ${businessType} Tips for ${targetMarket === 'Commercial' ? 'Your Business' : 'Your Home'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Structure:
🎯 Opening: Timely maintenance tip relevant to ${timeframe}
💡 Tip #1: Preventive maintenance specific to ${businessType}
💡 Tip #2: Cost-saving advice
💡 Tip #3: Warning sign to watch for
📞 Soft CTA: "Need help? We're here."
Length: 300-400 words
Tone: Helpful neighbor, not salesy
` : ''}

${campaignType === 'Seasonal Campaign' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL 1: SEASONAL ANNOUNCEMENT
Subject Line: ${timeframe} ${businessType} Special for ${audienceTerm}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Hook: Seasonal offer or limited-time value prop
⚠️ Problem: Why ${timeframe} maintenance matters
✅ Solution: Your ${businessType} service package
📊 Social Proof: Brief customer result
📞 CTA: "Book by [date] - limited slots"
Length: 250-300 words

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL 2: REMINDER (Send 1 week later)
Subject Line: Last Chance: ${timeframe} ${businessType} Special Ends Soon
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Urgency: Limited time/slots remaining
💡 Benefit Reminder: Why they need this service
🎁 Sweetener: Add small bonus or guarantee
📞 CTA: "Call today - only X spots left"
Length: 150-200 words

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL 3: FINAL NOTICE (Send 2 days before deadline)
Subject Line: FINAL DAY: ${timeframe} ${businessType} Special
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 Last chance messaging
💰 Offer recap
📞 Direct CTA: "Call now or miss out"
Length: 100-150 words
` : ''}

${campaignType === 'Reactivation' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL 1: GENTLE RECONNECTION
Subject Line: We miss you, [Name]! ${businessType} check-in
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤝 Opening: "It's been a while since we serviced your [property/business]"
⚠️ Risk: What can go wrong without regular ${businessType} maintenance
💡 Reminder: When they last used your services
🎁 Comeback Offer: Special discount for returning customers
📞 CTA: "Schedule inspection"
Length: 200-250 words
Tone: Warm but not desperate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL 2: VALUE REMINDER (Send 1 week later if no response)
Subject Line: Protecting Your ${targetMarket === 'Commercial' ? 'Business Investment' : 'Home Investment'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Cost of Neglect: What deferred ${businessType} maintenance costs
✅ Prevention Value: Why regular service saves money
📊 Case Study: Quick example of catching problem early
📞 CTA: "Let's prevent expensive repairs"
Length: 250-300 words
` : ''}

${campaignType === 'Nurture Sequence' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL 1: POST-SERVICE FOLLOW-UP (Send 3 days after job)
Subject Line: How's everything working, [Name]?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Check-in: "Just making sure your ${businessType} service is performing well"
💡 Maintenance Tip: One simple thing they can do
⭐ Review Request: Link to Google/Facebook
📞 Soft CTA: "Any questions, call us"
Length: 150-200 words

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL 2: EDUCATIONAL VALUE (Send 2 weeks later)
Subject Line: ${businessType} Maintenance Tip for ${audienceTerm}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Helpful Tip: Seasonal or preventive advice
⚠️ Warning Signs: When to call for service
🛠️ DIY vs Pro: What they can handle vs what needs expert
Length: 200-250 words

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL 3: MAINTENANCE REMINDER (Send 6-12 months after job, depending on service)
Subject Line: Time for Your ${businessType} Checkup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Timing: "It's been [X months] since we serviced your [system]"
✅ Preventive Value: Why regular maintenance matters
💰 Offer: Early booking discount or priority scheduling
📞 CTA: "Book your checkup"
Length: 200-250 words
` : ''}

Include 3-5 relevant hashtags if posting email content to social media.
Adapt tone for ${targetMarket} audience: ${targetMarket === 'Commercial' ? 'Professional, ROI-focused, business continuity emphasis' : targetMarket === 'Residential' ? 'Relatable, safety-focused, property value emphasis' : 'Balanced approach for both audiences'}

LOCAL CONTEXT: Mention "${city}" naturally in email content — reference local weather patterns, neighborhood names, or area-specific details. Local references increase open rates and trust. Use "${city}" in at least 1 subject line and 2-3 times across the email body copy.`;

      await callClaudeAPI(prompt, 4000);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatusMessage('');
    }
  };

  const generateFAQ = async () => {
    setStatusMessage('❓ Creating FAQ content...');

    try {
      const businessType = document.getElementById('faq_business_type')?.value || '';
      const targetMarket = document.getElementById('faq_target_market')?.value || '';
      const city = document.getElementById('faq_city')?.value || '';

      if (!businessType || !targetMarket || !city) {
        setError('Please fill in all required fields!');
        setStatusMessage('');
        return;
      }

      const audienceTerm = targetMarket === 'Commercial' ? 'business owners' : targetMarket === 'Residential' ? 'homeowners' : 'property owners';

      const prompt = `You are a $5,000/mo SEO content strategist for home services.

BUSINESS: ${businessType}
TARGET: ${targetMarket} ${audienceTerm}
CITY: ${city}

FORBIDDEN WORDS: amazing, incredible, blessed, excited, thrilled, unlock, harness, elevate, comprehensive, game-changer, "proud to serve"

YOUR JOB: Automatically identify the 10 most commonly searched questions that ${audienceTerm} in ${city} ask about ${businessType} services — then create a complete FAQ page answering them.

You know from search data what people actually Google. For ${businessType}, generate the real questions people search — things like cost, how to choose a contractor, timing, DIY vs professional, emergency situations, warranties, etc. Do NOT ask the user what topics to cover — YOU determine the most valuable questions based on search volume and intent.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PART 1: SEO FAQ PAGE FOR YOUR WEBSITE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PAGE TITLE & META
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

H1 Title: [SEO-optimized title about ${businessType} in ${city}]
Meta Description: (150-160 characters, keyword-rich, compelling)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 INTRODUCTION (75-100 words)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Brief overview for ${targetMarket} ${audienceTerm} in ${city}. Mention city naturally.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ THE 10 MOST SEARCHED QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate 10 Q&As based on what ${audienceTerm} actually search for regarding ${businessType}:

For each Q&A:
- Question in natural search language (how people actually type into Google)
- Answer: 100-175 words, specific, includes real numbers/prices/timeframes
- Include "${city}" in at least 3-4 answers for local SEO
- Use question format in headers (helps Google featured snippets)
- Every answer should position the business as the expert without being salesy

Must include these question TYPES (use natural phrasing specific to ${businessType}):
1. Cost/pricing question (ALWAYS #1 — most searched)
2. "How do I choose a good [trade]?" question
3. Emergency/urgency question
4. DIY vs professional question
5. Timing/frequency question
6. Common problem diagnosis question
7. Warranty/guarantee question
8-10. Three more high-value questions specific to ${businessType}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 CLOSING CTA (50 words)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Brief closing with CTA mentioning ${city}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PART 2: GOOGLE BUSINESS Q&A PAIRS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create 8 Q&A pairs optimized for Google Business Profile Q&A section.
These are shorter — customers ask quick questions on your Google listing.

Format for each:
Q: [Short customer question, 5-10 words]
A: [75-100 words, keyword-rich, includes ${businessType} and ${city}]

Must include: service area, emergency availability, pricing, credentials, payment methods, free estimates, response time, warranty.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOW TO POST THESE TO YOUR GOOGLE BUSINESS PROFILE:
1. Have a friend or family member ask the question on your Google listing (they search your business on Google → click "Ask a question")
2. Log into business.google.com with your business account
3. Find the question under Messages → Q&A
4. Copy-paste the answer as your response
5. Repeat for all 8 Q&As — takes about 10-15 minutes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SEO REQUIREMENTS:
- Use "${businessType}" and "${city}" throughout naturally
- Use question format in H2 headers
- Include specific numbers, prices, timeframes relevant to ${businessType}
- Write for ${targetMarket} ${audienceTerm} perspective
- Aim for 1,500-2,000 total words`;

      await callClaudeAPI(prompt, 5000);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatusMessage('');
    }
  };

  const generateObjectionHandler = async () => {
    setStatusMessage('💬 Creating objection scripts...');

    try {
      const businessType = document.getElementById('oh_business_type')?.value || '';
      const targetMarket = document.getElementById('oh_target_market')?.value || '';
      const objection = document.getElementById('oh_objection')?.value || '';
      const yourAdvantage = document.getElementById('oh_advantage')?.value || '';

      if (!businessType || !targetMarket || !objection) {
        setError('Please fill in all required fields!');
        setStatusMessage('');
        return;
      }

      const audienceTerm = targetMarket === 'Commercial' ? 'business decision-makers' : targetMarket === 'Residential' ? 'homeowners' : 'customers';

      const prompt = `You are a $5,000/mo sales strategist for home services specializing in objection handling.

BUSINESS: ${businessType}
TARGET: ${targetMarket} ${audienceTerm}
OBJECTION: ${objection}
${yourAdvantage ? `YOUR COMPETITIVE ADVANTAGE: ${yourAdvantage}` : ''}

FORBIDDEN WORDS: amazing, incredible, blessed, unlock, harness, elevate, comprehensive, game-changer, "proud to serve"

CONTENT VARIATION STRATEGY:
Rotate through these frameworks:
- FEEL-FELT-FOUND: "I understand how you feel... others felt the same... here's what they found..."
- COST OF INACTION: Show what happens if they DON'T act
- SOCIAL PROOF: "Other ${audienceTerm} said the same thing, until..."
- REFRAME: Change the perspective from cost to investment/risk mitigation
- URGENCY: Create legitimate time pressure

OUTPUT FORMATTING RULES:
- Use emojis strategically (💡 🎯 ⚡ 💰 🔥 📊 ⚠️ ✅ etc.)
- Add line breaks between sections
- Use visual separators like ━━━
- Make it scannable and easy to follow
- Include specific dollar amounts and numbers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create 3 different response scripts for this objection:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 RESPONSE #1: PHONE SCRIPT
Channel: Phone call during estimate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Acknowledge:** Validate their concern (don't dismiss it)
**Reframe:** Change perspective from objection to opportunity
**Evidence:** Specific example or data point supporting your position
${yourAdvantage ? `**Your Advantage:** Weave in your competitive edge naturally` : ''}
**Trial Close:** Ask for micro-commitment

Length: 150-200 words
Tone: Conversational but authoritative
Include: Specific numbers, customer example, question at end

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 RESPONSE #2: EMAIL/TEXT FOLLOW-UP
Channel: Written follow-up after estimate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subject Line: (Compelling, addresses objection directly)

**Opening:** Reference previous conversation
**Address Objection:** Directly tackle their concern with data/proof
**Value Proposition:** What they GET for their investment
**Risk Reversal:** Guarantee, warranty, or risk mitigation offer
${yourAdvantage ? `**Differentiation:** Why you're different from cheaper/other options` : ''}
**CTA:** Clear next step

Length: 200-250 words
Tone: Professional but warm
Include: Bullet points for easy scanning, specific cost breakdown or ROI calculation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RESPONSE #3: IN-PERSON CLOSING SCRIPT
Channel: Face-to-face during estimate or follow-up
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Empathy Statement:** Show understanding
**Comparison Reframe:** Compare to something they understand (car, insurance, etc.)
**Cost of Waiting:** What deferring costs them (escalation, damage, inefficiency)
**Success Story:** Specific ${audienceTerm} who had same objection, what happened
${yourAdvantage ? `**Unique Value:** What they can't get elsewhere` : ''}
**Assumptive Close:** Assume sale and ask about implementation details

Length: 200-250 words
Tone: Confident consultant, not pushy salesperson
Include: Analogies, specific customer name/situation, calendar/scheduling language

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 BONUS: QUICK COMEBACK PHRASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Provide 3-5 one-liner responses for this objection:
- Short, punchy comebacks (1-2 sentences each)
- Can be used immediately during conversation
- Memorable and repeatable
- Not aggressive, but confident

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Adapt all responses for ${targetMarket} audience: ${targetMarket === 'Commercial' ? 'Emphasize ROI, business continuity, liability reduction, professional reputation' : targetMarket === 'Residential' ? 'Emphasize property value, family safety, peace of mind, long-term savings' : 'Balance both perspectives'}`;

      await callClaudeAPI(prompt, 3500);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatusMessage('');
    }
  };

  const generateSeasonalCampaign = async () => {
    setStatusMessage('🎯 Building multi-channel campaign...');

    try {
      const businessType = document.getElementById('sc_business_type')?.value || '';
      const targetMarket = document.getElementById('sc_target_market')?.value || '';
      const season = document.getElementById('sc_season')?.value || '';
      const campaign = document.getElementById('sc_campaign')?.value || '';
      const city = document.getElementById('sc_city')?.value || '';
      const offer = document.getElementById('sc_offer')?.value || '';

      if (!businessType || !targetMarket || !season || !campaign || !city) {
        setError('Please fill in all required fields!');
        setStatusMessage('');
        return;
      }

      const audienceTerm = targetMarket === 'Commercial' ? 'business clients' : targetMarket === 'Residential' ? 'homeowners' : 'customers';

      const prompt = `You are an elite marketing strategist who creates agency-quality campaigns that small local businesses can execute themselves for FREE using organic social media, email, and community platforms. Your content matches what $5,000/mo agencies produce — but the business owner deploys it themselves at zero cost.

BUSINESS: ${businessType}
TARGET: ${targetMarket} ${audienceTerm}
SEASON/TIMING: ${season}
CAMPAIGN FOCUS: ${campaign}
CITY: ${city}
${offer ? `OFFER DETAILS: ${offer}` : ''}

FORBIDDEN WORDS: amazing, incredible, blessed, excited, thrilled, unlock, harness, elevate, comprehensive, game-changer, "proud to serve"

LOCAL CONTEXT: Use "${city}" naturally throughout all campaign pieces. Reference local weather patterns, neighborhoods, and community context. Nextdoor posts should feel like a neighbor talking, not a company advertising.

CONTENT VARIATION STRATEGY:
Rotate through these angles across different channels:
- VALUE ANGLE: Cost savings, ROI, preventive maintenance value
- URGENCY ANGLE: Seasonal timing, limited availability, weather-driven needs
- SOCIAL PROOF ANGLE: Customer stories, testimonials, local reputation
- EXPERTISE ANGLE: Technical knowledge, certifications, problem-solving capability
- CONVENIENCE ANGLE: Easy booking, fast service, hassle-free experience

OUTPUT FORMATTING RULES:
- Use emojis strategically for visual interest (💡 🎯 ⚡ 💰 🔥 📊 ⚠️ ✅ 📱 🏠 💼 🛠️ 📧 📞 etc.)
- Add line breaks between sections for readability
- Use visual separators like ━━━ between different campaign pieces
- Make it scannable - business owners need to copy/paste quickly
- Label each piece clearly so they know where to use it

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a COMPLETE multi-channel campaign with ALL of the following pieces:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 PIECE #1: EMAIL SEQUENCE (3 emails)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**EMAIL 1: ANNOUNCEMENT (Send: 2 weeks before campaign ends)**
Subject Line: [Create compelling subject for ${season} ${campaign}]

Body:
🎯 Hook: ${season} opportunity/problem
💡 Solution: Your ${businessType} service/offer
${offer ? '💰 Offer Details: Highlight value proposition' : ''}
✅ Benefit: Why act now for ${targetMarket}
📞 CTA: Clear booking action
Length: 250-300 words

**EMAIL 2: REMINDER (Send: 1 week before campaign ends)**
Subject Line: [Urgency-focused subject]

Body:
⏰ Time-sensitive reminder
📊 Social proof or stat
${offer ? '💰 Offer reminder' : '💡 Seasonal benefit reminder'}
📞 CTA: Book before deadline
Length: 200-250 words

**EMAIL 3: FINAL NOTICE (Send: 2 days before campaign ends)**
Subject Line: [Last chance subject]

Body:
🚨 Final hours/days messaging
💡 Quick benefit recap
📞 Urgent CTA
Length: 150-200 words

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 PIECE #2: SOCIAL MEDIA POSTS (4 posts for different platforms)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**POST 1 - FACEBOOK (Launch announcement)**
Platform: Facebook
Hook: ${season} problem or opportunity
${offer ? 'Offer details' : 'Service benefit'}
CTA: Link to booking
Hashtags: 3-5 relevant for ${businessType}
Length: 150-200 words

**POST 2 - NEXTDOOR (Local community focus)**
Platform: Nextdoor
Local angle: Neighborhood-specific messaging
${offer ? 'Limited slots for [neighborhood]' : 'Why ${season} matters locally'}
CTA: "Serving [city] since [year]"
Length: 150-200 words

**POST 3 - NEXTDOOR (Community focus)**
Platform: Nextdoor
Helpful neighbor tone
Seasonal relevance emphasized
${offer ? 'Offer in post' : 'Prevention-focused'}
Hashtags: Local area hashtags
Length: 100-150 words

**POST 4 - MID-CAMPAIGN REMINDER**
Platform: Facebook and Google Business Profile
Update on campaign progress
${offer ? 'Limited spots remaining' : 'Seasonal deadline approaching'}
Social proof element
CTA: Book now
Length: 100-150 words

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 PIECE #3: GOOGLE BUSINESS PROFILE POST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL: Google Business does NOT render markdown. Write this piece in PLAIN TEXT ONLY — no bold (**), no bullets (-), no markdown formatting of any kind. Use line breaks and emojis for visual structure instead.

Post Type: ${offer ? 'Offer' : 'What\'s New'}
Title: [${season} ${campaign}]
${offer ? 'Offer: [Specific deal with pricing]' : ''}
Description:
- ${season} relevance for ${targetMarket}
- Service benefit
- ${offer ? 'How to claim offer' : 'Why book now'}
- CTA: Click to call or book
- Mention ${city} at least twice for local SEO
Length: 100-150 words (Google truncates longer posts)
SEO Keywords: ${businessType}, ${season}, ${city}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 PIECE #4: FLYER COPY (For print/PDF distribution)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**HEADLINE:** [Bold, benefit-driven headline for ${season}]

**SUBHEADLINE:** [Supporting benefit for ${targetMarket}]

**BODY SECTIONS:**
🎯 The Problem: ${season} challenge for ${audienceTerm}
✅ The Solution: Your ${businessType} service
${offer ? '💰 Special Offer: [Specific deal with pricing and deadline]' : '💡 Why Now: Seasonal timing benefit'}
📊 Why Choose Us: 2-3 key differentiators
⚠️ Act Fast: Deadline or limited availability

**CONTACT INFO SECTION:**
📞 Phone: [Business phone]
🌐 Web: [Business website]
📍 Service Area: [City/region]

**FOOTER:**
License/certifications
Years in business
Satisfaction guarantee

Length: 400-500 words total
Design Notes: Suggest placement for images (before/after, team photo, etc.)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 PIECE #5: TEXT MESSAGE BLASTS (3 messages)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**TEXT 1: LAUNCH ANNOUNCEMENT**
[Business Name]: ${season} ${campaign} is here! ${offer ? '[Offer preview]' : '[Benefit preview]'} Book now: [link] Reply STOP to unsubscribe
Character count: <160 characters

**TEXT 2: MID-CAMPAIGN REMINDER**
[Business Name]: Don't miss ${season} ${campaign}! ${offer ? '[Slots filling fast]' : '[Deadline approaching]'} Book: [link] STOP to unsubscribe
Character count: <160 characters

**TEXT 3: LAST CHANCE**
[Business Name]: FINAL HOURS for ${season} ${campaign}! ${offer ? '[Offer ends today]' : '[Last chance this season]'} Book: [link] STOP to unsubscribe
Character count: <160 characters

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PIECE #6: CAMPAIGN EXECUTION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**2 WEEKS BEFORE:**
☐ Send Email #1 to customer list
☐ Post Facebook announcement
☐ Post Nextdoor announcement
☐ Post Google Business Profile update
☐ Distribute/mail flyers
☐ Send Text Blast #1

**1 WEEK BEFORE:**
☐ Send Email #2 (reminder)
☐ Post Facebook reminder
☐ Post mid-campaign reminder on Nextdoor

**3 DAYS BEFORE:**
☐ Send Text Blast #2 (reminder)

**FINAL DAY:**
☐ Send Email #3 (final notice)
☐ Send Text Blast #3 (last chance)
☐ Post final reminder on all social channels (Facebook, Nextdoor, Yelp)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FINAL OUTPUT: All 6 pieces clearly labeled and ready to copy/paste into respective platforms for ${targetMarket} ${audienceTerm}.

CRITICAL — CLOSING SECTION RULES:
Do NOT include any budget allocation, ad spend recommendations, or monthly cost breakdowns. These business owners are using this tool specifically to AVOID paying agencies and big marketing budgets.

Instead, end with a "🎯 CAMPAIGN COMPLETE" section that includes:

1. Confirm all 6 pieces are ready to deploy (list them briefly)

2. A "💰 TOTAL COST TO RUN THIS CAMPAIGN" section. YOU MUST USE THESE EXACT LINES — do not paraphrase, do not reword, do not summarize. Copy them word-for-word:

💰 TOTAL COST TO RUN THIS CAMPAIGN

▸ Facebook posts — FREE (see optional boost below)
▸ Nextdoor posts — FREE
▸ Google Business Profile — FREE
▸ Email to your customer list — FREE (use any free email platform like Mailchimp or your existing email)
▸ Flyer printing — Under $50 for 500 copies at a local print shop
▸ Text message blasts — To use the text blast pieces above, a low-cost SMS service like SlickText, EZTexting, or SimpleTexting runs $25-45/month for small customer lists. This is 100% optional but very effective for reaching repeat customers who've opted in to texts.

IMPORTANT: You MUST include ALL of these lines exactly as written above. Do not skip the text message line. Do not remove the "(see optional boost below)" from Facebook. Do not change the SMS service names.

3. A "📊 EXPECTED RESULTS (Organic Posting Only)" section — give realistic booking estimates based on their business type and city size

4. A "🚀 OPTIONAL LOW-COST BOOST" section. Include this guidance AND the step-by-step instructions below:

The ONLY paid boost worth considering: Take your best-performing Facebook post (whichever gets the most engagement in the first 24 hours) and boost it for $1-3/day.

Total spend: $30-90 for the entire campaign. That's your entire paid strategy. No agency needed.

Then include these EXACT step-by-step instructions:

📋 HOW TO BOOST A FACEBOOK POST (Step-by-Step):
1. Go to your Facebook Business Page (not your personal profile)
2. Find the post you want to boost — pick the one with the most likes, comments, and shares
3. Click the blue "Boost Post" button at the bottom right of the post
4. Set your AUDIENCE: Click "People you choose through targeting" → Location: your city + 15 miles → Age: 25-65 → Interests: leave blank or add "Homeowner"
5. Set your BUDGET: Choose "Daily budget" → Set to $1-3 per day
6. Set your DURATION: Run it for 10-30 days (matches your campaign timeline)
7. Click "Boost Post Now"
That's it — 5 minutes of setup. Facebook does the rest. You can pause or stop anytime from your Page settings.

You MUST include these numbered steps exactly. Do not skip them or summarize them. These business owners have never done this before and need the walkthrough.

5. A "🏆 WHAT YOU JUST CREATED" closer that reinforces: "This is exactly what marketing agencies charge $2,000-5,000 to build. You just did it yourself. Total cost: $0 for the strategy, $0 to deploy organically."

Do NOT recommend Google Ads, paid ad platforms, agency retainers, promoted Nextdoor posts, or any monthly spend over $100. The whole point is these campaigns work through organic posting, community engagement, and word-of-mouth.`;

      await callClaudeAPI(prompt, 8000);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatusMessage('');
    }
  };

  // Clear state when opening a new modal
  const openModal = (modalName) => {
    setOutput('');
    setError('');
    setStatusMessage('');
    setLoading(false);
    setSaveSuccess(false);
    setViewingLibraryItem(null);
    setActiveModal(modalName);

    // Set module name for library saving
    const moduleNames = {
      weekContent: 'Week of Content',
      jobPipeline: 'Job Pipeline',
      calendar: '30-Day Calendar',
      weatherAlert: 'Weather Alert',
      beforeAfter: 'Before/After Story',
      videoScript: 'Video Script Command Center',
      gmbPost: 'Google Business Post',
      competitorAnalysis: 'Competitor Analysis',
      reviewMax: 'Review Maximizer',
      dailyTip: 'Daily Tip Generator',
      emailCampaign: 'Email Campaign Builder',
      faqGenerator: 'FAQ Generator',
      objectionHandler: 'Objection Handler',
      seasonalCampaign: 'Seasonal Campaign Builder',
      library: 'Content Library'
    };
    setCurrentModuleName(moduleNames[modalName] || '');
  };

  // Save content to library
  const saveToLibrary = () => {
    if (!output) return;

    const businessType =
      document.getElementById('wc_business_type')?.value ||
      document.getElementById('jp_business_type')?.value ||
      document.getElementById('cal_business_type')?.value ||
      document.getElementById('wa_business_type')?.value ||
      document.getElementById('ba_business_type')?.value ||
      document.getElementById('vs_business_type')?.value ||
      document.getElementById('gmb_business_type')?.value ||
      document.getElementById('ci_business_type')?.value ||
      document.getElementById('rm_business_type')?.value ||
      'Unknown';

    const targetMarket =
      document.getElementById('wc_target_market')?.value ||
      document.getElementById('jp_target_market')?.value ||
      document.getElementById('cal_target_market')?.value ||
      document.getElementById('wa_target_market')?.value ||
      document.getElementById('ba_target_market')?.value ||
      document.getElementById('vs_target_market')?.value ||
      document.getElementById('gmb_target_market')?.value ||
      document.getElementById('ci_target_market')?.value ||
      document.getElementById('rm_target_market')?.value ||
      'Unknown';

    const newItem = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      module: currentModuleName,
      businessType: businessType,
      targetMarket: targetMarket,
      content: output,
      preview: output.substring(0, 150) + '...'
    };

    setContentLibrary(prev => [newItem, ...prev]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Delete from library
  const deleteFromLibrary = (id) => {
    if (confirm('Delete this content from your library?')) {
      setContentLibrary(prev => prev.filter(item => item.id !== id));
    }
  };

  // Tool Cards Data
  const tools = [
    {
      id: 'gettingStarted',
      icon: '🎓',
      title: 'GETTING STARTED — SETUP GUIDE',
      description: 'Set up your social media platforms the right way',
      why: '💡 Why START HERE: You can\'t post content without platforms! This teaches you which platforms you NEED, how to set them up correctly, and what you must do to be seen by the algorithm. Essential foundation before using any other tools!'
    },
    {
      id: 'momentumEngine',
      icon: '🔥',
      title: 'THE MOMENTUM ENGINE',
      description: 'Your Daily & Post-Job Habits That Turn Every Job Into Marketing.',
      why: '💡 Why USE THIS: Most pros finish a job and drive to the next one. This module gives you the 3 daily habits that turn every completed job into a lead-generating machine — the \"Single Job Multiplier,\" the \"Review-on-the-Spot\" system, and the \"Lead Sniper\" routine. 10 minutes a day, zero marketing experience needed.'
    },
    {
      id: 'visibilityPlaybook',
      icon: '🚀',
      title: 'THE VISIBILITY PLAYBOOK',
      description: 'Stop Working for Free & Start Forcing the Algorithm\'s Hand.',
      why: '💡 Why USE THIS: Today, "Post and Pray" is dead. If you don\'t trigger the First-Hour Spike, your content is invisible. This playbook gives you the "Cheat Codes" to bypass AI filters and ensure your posts land in front of local homeowners who are ready to buy.'
    },
    {
      id: 'library',
      icon: '📚',
      title: 'MY CONTENT LIBRARY',
      description: `Saved content: ${contentLibrary.length} item${contentLibrary.length !== 1 ? 's' : ''}`,
      why: '💡 Access all your saved content in one place. Search, filter, and reuse marketing assets anytime!'
    },
    {
      id: 'seoGuide',
      icon: '🔍',
      title: 'WEBSITE SEO GUIDE',
      description: 'Fire Your Agency & Outrank the Big Budgets.',
      why: '💡 Why USE THIS: Today, SEO isn\'t about "keywords"—it\'s about "Answer Authority." This guide shows you how to structure your site so Siri, ChatGPT, and Google SGE recommend you first. Includes the Schema Generator Sync, the Landmark Hack, and the Answer Engine Strategy.'
    },
    {
      id: 'hyperLocalSeo',
      icon: '📍',
      title: 'HYPER-LOCAL SEO',
      description: 'Stop Chasing Every Lead & Start Dominating Your Best Zip Codes.',
      why: '💡 Why USE THIS: Today, the "50-mile radius" is a death sentence for your rankings. This playbook shows you how to use Visual Metadata and Neighborhood Landing Pages to force Google to show your business to the wealthiest 10% of your service area. Rank #1 where the profit is highest.'
    },
    {
      id: 'neighborhoodSniper',
      icon: '🏘️',
      title: 'THE NEIGHBORHOOD SNIPER',
      description: 'Stop Waiting for the Phone & Start Hunting High-Intent Leads.',
      why: '💡 Why USE THIS: 90% of your competitors are "Passive." This playbook makes you "Active." Learn to use Keyword Alerts to find customers the moment they post about a problem, and the Stealth Tag-Team strategy to get recommended by neighbors — so you never look like a "Salesman."'
    },
    {
      id: 'authorityBuilder',
      icon: '🛡️',
      title: 'THE AUTHORITY BUILDER',
      description: 'Stop Competing on Price & Start Winning Premium Jobs on Proof.',
      why: '💡 Why USE THIS: Price shoppers disappear when they see proof. This playbook teaches you how to build undeniable credibility — professional documentation, scientific diagnostics, and instant-contact systems that make high-end customers choose you over the cheapest bid. Includes the Diagnostic Map, the One-Tap Call Hack, and the Anti-Scrub Checklist for insurance work.'
    },
    {
      id: 'competitorIntel',
      icon: '🕵️',
      title: 'COMPETITOR INTEL',
      description: 'Stop Guessing What Works & Start "Leaning" on Their Data.',
      why: '💡 Why USE THIS: Your competitors have already spent thousands testing ads and keywords—stop paying for their mistakes. This module gives you the "Spy Glass" to see their Winning Keywords, their Longest-Running Ads, and the 1-Star Complaints that are essentially a "Shopping List" for your business. Out-smart the franchises without their budget.'
    },
    {
      id: 'analytics',
      icon: '📊',
      title: 'ANALYTICS DASHBOARD GUIDE',
      description: 'Stop Guessing. Start Scaling with Data-Backed Decisions.',
      why: '💡 Why USE THIS: "Likes" don\'t pay the mortgage—Action Velocity does. This guide teaches you how to ignore the noise and find the "Profit Signals" in your data. Learn which zip codes are actually calling you and which "Hacks" are beating the franchises. Data-driven decisions = Higher ROI and shorter workdays.'
    },
    {
      id: 'roiCalculator',
      icon: '🎯',
      title: 'ROI CALCULATOR',
      description: 'See Exactly Which Marketing Channels Are Making (or Losing) You Money.',
      why: '💡 Why USE THIS: Stop guessing where your money goes. Input your spend and leads per channel—get instant cost-per-lead, cost-per-job, and ROI rankings. See which channels to double down on and which to cut. Pure math, zero guesswork.'
    },
    {
      id: 'unfairAdvantage',
      icon: '🚀',
      title: 'THE UNFAIR ADVANTAGE GUIDE',
      description: 'Dominate Secret Lead Sources Your Competitors Don\'t Even Know Exist.',
      why: '💡 Why USE THIS: Most pros are fighting for the same 3 leads on Angi or overpaying for Google Ads. This is your "Secret Sauce"—a playbook for the emerging platforms where competition is zero. These are digital, high-intent sources that put you in front of the customer before they even open a search bar. Be the first to claim your territory and win the high-margin jobs for a fraction of the cost.'
    },
    {
      id: 'roadmap',
      icon: '📋',
      title: 'THE 30-DAY DOMINATION ROADMAP',
      description: '90 Minutes a Week to Unstoppable Local Authority',
      why: '💡 Why USE THIS: Follow this system exactly for 90 days. You aren\'t just "posting content"—you are engineering a local monopoly. Daily "Sniper" habits, weekly Authority moves, and monthly optimization. 95% of competitors are "guessing." You have a SYSTEM.'
    },
    {
      id: 'offlineMarketing',
      icon: '🥷',
      title: 'GUERRILLA MARKETING TACTICS',
      description: 'Win the Street While Your Competitors Fight Over Google.',
      why: '💡 Why USE THIS: This is the era of "Ad Blindness." People skip YouTube ads, but they can\'t skip a branded truck on their street or a QR code on a neighbor\'s trash can. This playbook gives you the "Underground" moves to build a local monopoly for the cost of a tank of gas. Own the neighborhood, not just the search results.'
    },
    {
      id: 'weekContent',
      icon: '🔥',
      title: 'One Job = One Week of Content',
      description: 'Enter ONE completed job and AI generates 7 days of marketing content across all platforms!',
      why: '💡 Why USE THIS: One completed job = 7 days of expert marketing content across every platform. Each piece is written in the native tone of that platform—Google gets SEO, Nextdoor gets neighbor energy, Facebook gets storytelling. A marketing agency charges $2,000/month for this. You generate it in 60 seconds.'
    },
    {
      id: 'seasonalCampaign',
      icon: '🎯',
      title: 'Seasonal Campaign Builder',
      description: 'Full multi-channel campaign in one click: email sequence, social posts, GBP updates, flyer copy, and text blasts.',
      why: '💡 Why USE THIS: Drives bookings during seasonal peaks. Saves hours of planning. Launch a complete campaign across all channels instantly!'
    },
    {
      id: 'jobPipeline',
      icon: '🔄',
      title: 'Job Pipeline (After Every Job)',
      description: 'The "In-The-Truck" routine: finish a job → 2 minutes → get a blog post, 3 platform-specific social posts (Facebook, Nextdoor, GBP), and review request email.',
      why: '💡 Why USE THIS: Finish a job → open this tool → 2 minutes later you have a blog post ranking on Google, platform-specific social posts for Facebook, Nextdoor, AND Google Business Profile, and a review request email ready to send. The "In-The-Truck" routine that turns every single job into multiple revenue streams before you start the next one.'
    },
    {
      id: 'calendar',
      icon: '📆',
      title: '30-Day Content Calendar',
      description: 'Monthly strategic calendar with daily post topics, platforms, and hooks pre-planned.',
      why: '💡 Why USE THIS: "What should I post today?" kills more marketing momentum than anything else. Generate a full month of daily post topics, platforms, and hooks in 60 seconds. Plan once on the 1st, execute all month. Consistency beats creativity—and this makes consistency effortless.'
    },
    {
      id: 'weatherAlert',
      icon: '⚡',
      title: 'Weather Alert Urgency Posts',
      description: 'Turn incoming weather threats into immediate lead-generation posts.',
      why: '💡 Why USE THIS: When a storm hits, search volume for your trade spikes 300-800% in 4 hours. This tool generates urgency posts BEFORE the storm arrives—so you\'re the first name homeowners see when they panic-search. First to post = first to book. Weather is the ultimate free lead trigger.'
    },
    {
      id: 'beforeAfter',
      icon: '📸',
      title: 'Before/After Story Generator',
      description: 'Transform job photos into compelling before/after stories for Facebook and Google Business Profile posts.',
      why: '💡 Why USE THIS: A job photo with no story gets 12 likes. A before/after with a diagnostic narrative gets 200+ views, 30 saves, and 3 DMs asking "can you do this for me?" This tool writes the story, the SEO alt-text, and the geotagged caption—your photos become Google ranking signals, not just Facebook posts.'
    },
    {
      id: 'videoScript',
      icon: '🎬',
      title: 'Video Script Command Center',
      description: 'ONE job input generates up to 8 ready-to-film video scripts: Before/After, Case Study, Neighborhood Post, Tips, Behind-the-Scenes, Pattern Interrupt, and more.',
      why: '💡 Why USE THIS: Every job = multiple professional video scripts in 2 minutes. Film once, post everywhere. Includes CapCut editing guide!'
    },
    {
      id: 'gmbPost',
      icon: '📍',
      title: 'Google Business Post Optimizer',
      description: 'Create Google Business Profile posts that rank locally and drive calls.',
      why: '💡 Why USE THIS: 90% of your competitors have NEVER posted to their Google Business Profile. Every GBP post is a free ad that appears directly in search results and Maps. This tool writes SEO-optimized posts with your landmark, zip code, and trade keywords baked in—so Google sees you as the most active business in your area.'
    },
    {
      id: 'competitorAnalysis',
      icon: '🔍',
      title: 'Competitor Analysis Tool',
      description: 'Analyze competitor ads/posts and generate scientifically superior versions highlighting YOUR advantages.',
      why: '💡 Why USE THIS: Your competitors are spending thousands testing ads and keywords—why pay for their education? Paste their best ad or post, and this tool reverse-engineers what\'s working, then generates a scientifically superior version highlighting YOUR advantages. 60 seconds of intel that would cost $500 from a marketing consultant.'
    },
    {
      id: 'reviewMax',
      icon: '⭐',
      title: 'Review Maximizer',
      description: 'Turn one 5-star review into 4 marketing assets: social post, referral email, Google Business update, and SEO-rich review reply.',
      why: '💡 Why USE THIS: Most businesses get a 5-star review and say "thanks!" That review dies. This tool turns ONE review into 4 marketing assets: a social proof post, a referral request email, a GBP update, and a keyword-rich review reply that boosts your SEO. Every review should work 4x harder for you.'
    },
    {
      id: 'dailyTip',
      icon: '💡',
      title: 'Daily Tip Generator',
      description: 'Generate expert tips to educate customers and build trust. Educational content gets 2x more engagement!',
      why: '💡 Why USE THIS: People SAVE helpful tips → algorithm boost. They SHARE tips → more reach. You become the trusted expert they call when they need help. Post even on slow days when you have no job photos!'
    },
    {
      id: 'emailCampaign',
      icon: '📧',
      title: 'Email Campaign Builder',
      description: 'Creates complete email sequences for newsletters, seasonal campaigns, reactivation, and nurture flows.',
      why: '💡 Why USE THIS: Your email list is the ONLY marketing asset you own (not controlled by algorithms). Direct communication = direct revenue. Build customer loyalty and repeat business!'
    },
    {
      id: 'faqGenerator',
      icon: '❓',
      title: 'FAQ/Website Content Generator',
      description: 'Turns customer questions into SEO-optimized website pages that rank in Google and answer questions 24/7.',
      why: '💡 Why USE THIS: Ranks in Google for "how much does X cost" searches. Positions you as the expert. Answers customer questions while you sleep!'
    },
    {
      id: 'objectionHandler',
      icon: '💬',
      title: 'Objection Handler Scripts',
      description: 'Creates persuasive responses to sales objections + NEW: Service Recovery scripts for 1-8 customer ratings.',
      why: '💡 Why USE THIS: Turn estimates into bookings AND save relationships before they hit Google! Most jobs are lost because of weak objection handling.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .modal-backdrop {
          backdrop-filter: blur(8px);
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tool-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tool-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
        }

        .btn {
          transition: all 0.2s ease;
        }

        .btn:hover {
          transform: scale(1.02);
        }

        .btn:active {
          transform: scale(0.98);
        }

        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top-color: #3b82f6;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .output-box {
          line-height: 1.8;
          font-size: 14px;
          color: #1e293b;
        }

        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .quicknav {
          position: fixed;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          z-index: 40;
          transition: transform 0.3s ease;
        }

        .quicknav.collapsed {
          transform: translateY(-50%) translateX(-100%);
        }

        .quicknav-toggle {
          position: fixed;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          z-index: 41;
          transition: left 0.3s ease;
        }

        .quicknav-btn {
          display: block;
          width: 100%;
          text-align: left;
          padding: 4px 10px;
          font-size: 11px;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }

        .quicknav-btn:hover {
          background: rgba(255,255,255,0.15);
        }

        .quicknav-divider {
          height: 1px;
          background: rgba(255,255,255,0.15);
          margin: 4px 8px;
        }

        @media (max-width: 1024px) {
          .quicknav, .quicknav-toggle { display: none; }
        }

        .mobile-menu-btn {
          display: none;
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 45;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 2px solid rgba(59, 130, 246, 0.5);
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          transition: transform 0.2s;
        }

        .mobile-menu-btn:active {
          transform: scale(0.95);
        }

        .mobile-menu-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 44;
          background: rgba(15, 23, 42, 0.97);
          backdrop-filter: blur(8px);
          overflow-y: auto;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        .mobile-menu-overlay.open {
          display: flex;
          flex-direction: column;
        }

        .mobile-menu-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          font-size: 15px;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.15s;
        }

        .mobile-menu-item:active {
          background: rgba(255,255,255,0.1);
        }

        @media (max-width: 1024px) {
          .mobile-menu-btn { display: flex; align-items: center; justify-content: center; }
        }
      `}</style>

      {/* Quick Nav Sidebar — desktop only */}
      {!activeModal && (
        <>
          <div className={`quicknav ${showQuickNav ? '' : 'collapsed'}`}>
            <div className="bg-slate-800/95 backdrop-blur border-r border-slate-600 rounded-r-xl py-3 px-2 shadow-2xl" style={{maxHeight: '80vh', overflowY: 'auto'}}>
              <p className="text-[10px] text-orange-400 font-bold px-2 mb-1 uppercase tracking-wider">Guides</p>
              <button className="quicknav-btn text-orange-200" onClick={() => openModal('gettingStarted')}>🎓 Getting Started</button>
              <button className="quicknav-btn text-orange-200" onClick={() => openModal('roadmap')}>📋 30-Day Roadmap</button>
              <button className="quicknav-btn text-orange-200" onClick={() => openModal('momentumEngine')}>🔥 Momentum Engine</button>
              <button className="quicknav-btn text-orange-200" onClick={() => openModal('visibilityPlaybook')}>🚀 Visibility Playbook</button>
              <button className="quicknav-btn text-orange-200" onClick={() => openModal('seoGuide')}>🔍 Website SEO</button>
              <button className="quicknav-btn text-orange-200" onClick={() => openModal('hyperLocalSeo')}>📍 Hyper-Local SEO</button>
              <button className="quicknav-btn text-orange-200" onClick={() => openModal('neighborhoodSniper')}>🏘️ Neighborhood Sniper</button>
              <button className="quicknav-btn text-orange-200" onClick={() => openModal('authorityBuilder')}>🛡️ Authority Builder</button>
              <button className="quicknav-btn text-orange-200" onClick={() => openModal('competitorIntel')}>🕵️ Competitor Intel</button>
              <button className="quicknav-btn text-orange-200" onClick={() => openModal('unfairAdvantage')}>🚀 Unfair Advantage</button>
              <button className="quicknav-btn text-orange-200" onClick={() => openModal('offlineMarketing')}>🥷 Guerrilla Marketing</button>
              <button className="quicknav-btn text-orange-200" onClick={() => openModal('analytics')}>📊 Analytics</button>
              <button className="quicknav-btn text-orange-200" onClick={() => openModal('roiCalculator')}>🎯 ROI Calculator</button>
              <div className="quicknav-divider"></div>
              <p className="text-[10px] text-green-400 font-bold px-2 mb-1 mt-1 uppercase tracking-wider">Tools</p>
              <button className="quicknav-btn text-green-200" onClick={() => openModal('weekContent')}>🔥 Week of Content</button>
              <button className="quicknav-btn text-green-200" onClick={() => openModal('seasonalCampaign')}>🎯 Seasonal Campaign</button>
              <button className="quicknav-btn text-green-200" onClick={() => openModal('jobPipeline')}>🔄 Job Pipeline</button>
              <button className="quicknav-btn text-green-200" onClick={() => openModal('calendar')}>📆 30-Day Calendar</button>
              <button className="quicknav-btn text-green-200" onClick={() => openModal('weatherAlert')}>⚡ Weather Alert</button>
              <button className="quicknav-btn text-green-200" onClick={() => openModal('beforeAfter')}>📸 Before/After</button>
              <button className="quicknav-btn text-green-200" onClick={() => openModal('videoScript')}>🎬 Video Script</button>
              <button className="quicknav-btn text-green-200" onClick={() => openModal('gmbPost')}>📍 Google Business Post</button>
              <button className="quicknav-btn text-green-200" onClick={() => openModal('competitorAnalysis')}>🔍 Competitor Analysis</button>
              <button className="quicknav-btn text-green-200" onClick={() => openModal('reviewMax')}>⭐ Review Maximizer</button>
              <button className="quicknav-btn text-green-200" onClick={() => openModal('dailyTip')}>💡 Daily Tip</button>
              <button className="quicknav-btn text-green-200" onClick={() => openModal('emailCampaign')}>📧 Email Campaign</button>
              <button className="quicknav-btn text-green-200" onClick={() => openModal('faqGenerator')}>❓ FAQ Generator</button>
              <button className="quicknav-btn text-green-200" onClick={() => openModal('objectionHandler')}>💬 Objection Handler</button>
              <div className="quicknav-divider"></div>
              <button className="quicknav-btn text-purple-200" onClick={() => openModal('library')}>📚 My Library</button>
            </div>
          </div>
          <button
            className="quicknav-toggle"
            onClick={() => setShowQuickNav(!showQuickNav)}
            style={{left: showQuickNav ? '168px' : '0px'}}
          >
            <div className="bg-slate-700/90 text-white px-1.5 py-3 rounded-r-lg border border-slate-500 shadow-lg hover:bg-slate-600 transition-colors">
              <span className="text-xs font-bold">{showQuickNav ? '◀' : '▶'}</span>
            </div>
          </button>
        </>
      )}

      {/* Mobile Quick Menu — tablet & phone only */}
      {!activeModal && (
        <>
          <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(true)}>
            ⚡
          </button>
          <div className={`mobile-menu-overlay ${showMobileMenu ? 'open' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">⚡ Quick Launch</h3>
              <button onClick={() => setShowMobileMenu(false)} className="text-white text-2xl font-bold px-3 py-1">✕</button>
            </div>
            <p className="text-[11px] text-orange-400 font-bold uppercase tracking-wider mb-2 px-2">📚 Guides</p>
            <button className="mobile-menu-item text-orange-200" onClick={() => { openModal('gettingStarted'); setShowMobileMenu(false); }}>🎓 Getting Started</button>
            <button className="mobile-menu-item text-orange-200" onClick={() => { openModal('roadmap'); setShowMobileMenu(false); }}>📋 30-Day Roadmap</button>
            <button className="mobile-menu-item text-orange-200" onClick={() => { openModal('momentumEngine'); setShowMobileMenu(false); }}>🔥 Momentum Engine</button>
            <button className="mobile-menu-item text-orange-200" onClick={() => { openModal('visibilityPlaybook'); setShowMobileMenu(false); }}>🚀 Visibility Playbook</button>
            <button className="mobile-menu-item text-orange-200" onClick={() => { openModal('seoGuide'); setShowMobileMenu(false); }}>🔍 Website SEO</button>
            <button className="mobile-menu-item text-orange-200" onClick={() => { openModal('hyperLocalSeo'); setShowMobileMenu(false); }}>📍 Hyper-Local SEO</button>
            <button className="mobile-menu-item text-orange-200" onClick={() => { openModal('neighborhoodSniper'); setShowMobileMenu(false); }}>🏘️ Neighborhood Sniper</button>
            <button className="mobile-menu-item text-orange-200" onClick={() => { openModal('authorityBuilder'); setShowMobileMenu(false); }}>🛡️ Authority Builder</button>
            <button className="mobile-menu-item text-orange-200" onClick={() => { openModal('competitorIntel'); setShowMobileMenu(false); }}>🕵️ Competitor Intel</button>
            <button className="mobile-menu-item text-orange-200" onClick={() => { openModal('unfairAdvantage'); setShowMobileMenu(false); }}>🚀 Unfair Advantage</button>
            <button className="mobile-menu-item text-orange-200" onClick={() => { openModal('offlineMarketing'); setShowMobileMenu(false); }}>🥷 Guerrilla Marketing</button>
            <button className="mobile-menu-item text-orange-200" onClick={() => { openModal('analytics'); setShowMobileMenu(false); }}>📊 Analytics</button>
            <button className="mobile-menu-item text-orange-200" onClick={() => { openModal('roiCalculator'); setShowMobileMenu(false); }}>🎯 ROI Calculator</button>
            <div style={{height: '1px', background: 'rgba(255,255,255,0.15)', margin: '8px 0'}}></div>
            <p className="text-[11px] text-green-400 font-bold uppercase tracking-wider mb-2 px-2">🛠️ Tools</p>
            <button className="mobile-menu-item text-green-200" onClick={() => { openModal('weekContent'); setShowMobileMenu(false); }}>🔥 Week of Content</button>
            <button className="mobile-menu-item text-green-200" onClick={() => { openModal('seasonalCampaign'); setShowMobileMenu(false); }}>🎯 Seasonal Campaign</button>
            <button className="mobile-menu-item text-green-200" onClick={() => { openModal('jobPipeline'); setShowMobileMenu(false); }}>🔄 Job Pipeline</button>
            <button className="mobile-menu-item text-green-200" onClick={() => { openModal('calendar'); setShowMobileMenu(false); }}>📆 30-Day Calendar</button>
            <button className="mobile-menu-item text-green-200" onClick={() => { openModal('weatherAlert'); setShowMobileMenu(false); }}>⚡ Weather Alert</button>
            <button className="mobile-menu-item text-green-200" onClick={() => { openModal('beforeAfter'); setShowMobileMenu(false); }}>📸 Before/After</button>
            <button className="mobile-menu-item text-green-200" onClick={() => { openModal('videoScript'); setShowMobileMenu(false); }}>🎬 Video Script</button>
            <button className="mobile-menu-item text-green-200" onClick={() => { openModal('gmbPost'); setShowMobileMenu(false); }}>📍 Google Business Post</button>
            <button className="mobile-menu-item text-green-200" onClick={() => { openModal('competitorAnalysis'); setShowMobileMenu(false); }}>🔍 Competitor Analysis</button>
            <button className="mobile-menu-item text-green-200" onClick={() => { openModal('reviewMax'); setShowMobileMenu(false); }}>⭐ Review Maximizer</button>
            <button className="mobile-menu-item text-green-200" onClick={() => { openModal('dailyTip'); setShowMobileMenu(false); }}>💡 Daily Tip</button>
            <button className="mobile-menu-item text-green-200" onClick={() => { openModal('emailCampaign'); setShowMobileMenu(false); }}>📧 Email Campaign</button>
            <button className="mobile-menu-item text-green-200" onClick={() => { openModal('faqGenerator'); setShowMobileMenu(false); }}>❓ FAQ Generator</button>
            <button className="mobile-menu-item text-green-200" onClick={() => { openModal('objectionHandler'); setShowMobileMenu(false); }}>💬 Objection Handler</button>
            <div style={{height: '1px', background: 'rgba(255,255,255,0.15)', margin: '8px 0'}}></div>
            <button className="mobile-menu-item text-purple-200" onClick={() => { openModal('library'); setShowMobileMenu(false); }}>📚 My Library</button>
            <div style={{height: '40px'}}></div>
          </div>
        </>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 text-center border-b-2 border-blue-500 pb-8">
        {/* Logo Area */}
        <div className="mb-4 text-center">
          <div style={{display: 'inline-block', textAlign: 'center'}}>
              <div style={{fontSize: '42px', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1}}>
                <span style={{color: '#64748b'}}>⚙</span><span style={{color: '#f59e0b', margin: '0 -2px'}}>/</span><span style={{color: '#334155', fontFamily: 'system-ui'}}>perate</span><span style={{color: '#1e3a5f', fontFamily: 'system-ui', fontWeight: 900}}>AI</span>
              </div>
              <div style={{fontSize: '13px', fontWeight: 700, letterSpacing: '3.5px', color: '#94a3b8', marginTop: '4px', textTransform: 'uppercase'}}>The Engine Behind the Expert.</div>
            </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 whitespace-nowrap">
          THE LOCAL POWER MARKETING SUITE
        </h1>
        <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
          The "Done-For-You" Marketing Engine for Home Services Pros Who Are Too Busy for Marketing.
        </p>
        <p className="text-lg text-blue-400 mt-2">
          Plumbers • HVAC • Electricians • Roofers • Restoration & 30+ Other Home Service Trades
        </p>

        {/* Confidence Blurb */}
        <div className="mt-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 max-w-3xl mx-auto">
          <p className="text-lg text-blue-100 leading-relaxed">
            🚀 <strong>Why it works:</strong> Stop guessing what to post and start using a system built for the algorithm.
            From AI-powered content to Competitor Intel, this suite gives you the weapons to own your zip code—<strong>without the $2,000/mo agency fee.</strong>
          </p>
        </div>
      </div>

      {/* SECTION 1: GUIDES & EDUCATION */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center justify-center mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1"></div>
          <h2 className="text-2xl font-bold text-orange-400 px-6 flex items-center gap-3">
            📚 GUIDES & EDUCATION
            <span className="text-sm font-normal text-orange-300">(Start Here!)</span>
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1"></div>
        </div>
        <p className="text-center text-orange-200/80 text-sm mb-6 -mt-4">Strategy playbooks that teach the "why" behind every tool. Start with Getting Started, then follow the Roadmap.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.filter(tool =>
            tool.id === 'gettingStarted' ||
            tool.id === 'momentumEngine' ||
            tool.id === 'visibilityPlaybook' ||
            tool.id === 'seoGuide' ||
            tool.id === 'hyperLocalSeo' ||
            tool.id === 'neighborhoodSniper' ||
            tool.id === 'authorityBuilder' ||
            tool.id === 'competitorIntel' ||
            tool.id === 'analytics' ||
            tool.id === 'roiCalculator' ||
            tool.id === 'unfairAdvantage' ||
            tool.id === 'roadmap' ||
            tool.id === 'offlineMarketing'
          ).sort((a, b) => {
            const order = ['gettingStarted', 'roadmap', 'momentumEngine', 'visibilityPlaybook', 'seoGuide', 'hyperLocalSeo', 'neighborhoodSniper', 'authorityBuilder', 'competitorIntel', 'unfairAdvantage', 'offlineMarketing', 'analytics', 'roiCalculator'];
            return order.indexOf(a.id) - order.indexOf(b.id);
          }).map(tool => (
            <div
              key={tool.id}
              className="tool-card bg-white text-slate-900 rounded-2xl p-8 shadow-xl cursor-pointer border-4 border-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50 relative flex flex-col"
              onClick={() => openModal(tool.id)}
            >
              {tool.id === 'gettingStarted' && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse shadow-lg">
                  ⭐ START HERE
                </div>
              )}
              <div className="text-5xl mb-4">{tool.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-orange-700">{tool.title}</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">{tool.description}</p>
              <div className="p-3 rounded-lg text-sm border-l-4 bg-orange-100 text-orange-900 border-orange-500 mb-4">
                {tool.why}
              </div>
              <button className="btn w-full mt-auto pt-6 text-white py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700">
                {tool.id === 'gettingStarted' ? '🎓 Open Setup Guide' :
                 tool.id === 'momentumEngine' ? '🔥 Open Momentum Engine' :
                 tool.id === 'visibilityPlaybook' ? '🚀 Open Visibility Playbook' :
                 tool.id === 'seoGuide' ? '🔍 Open SEO Guide' :
                 tool.id === 'hyperLocalSeo' ? '📍 Open Hyper-Local SEO' :
                 tool.id === 'neighborhoodSniper' ? '🏘️ Open Neighborhood Sniper' :
                 tool.id === 'authorityBuilder' ? '🛡️ Open Authority Builder' :
                 tool.id === 'competitorIntel' ? '🕵️ Open Competitor Intel' :
                 tool.id === 'analytics' ? '📊 Open Analytics Guide' :
                 tool.id === 'roiCalculator' ? '🎯 Open ROI Calculator' :
                 tool.id === 'unfairAdvantage' ? '🚀 Open Unfair Advantage Guide' :
                 tool.id === 'roadmap' ? '📋 Open 30-Day Roadmap' :
                 tool.id === 'offlineMarketing' ? '🥷 Open Guerrilla Marketing' :
                 'Open Guide'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: MARKETING TOOLS */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center justify-center mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-green-500 to-transparent flex-1"></div>
          <h2 className="text-2xl font-bold text-green-400 px-6 flex items-center gap-3">
            🛠️ MARKETING TOOLS
            <span className="text-sm font-normal text-green-300">(Generate Content)</span>
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-green-500 to-transparent flex-1"></div>
        </div>
        <p className="text-center text-green-200/80 text-sm mb-6 -mt-4">AI-powered generators that create ready-to-post content. Pick a tool, fill in your details, click generate.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.filter(tool =>
            tool.id !== 'gettingStarted' &&
            tool.id !== 'momentumEngine' &&
            tool.id !== 'visibilityPlaybook' &&
            tool.id !== 'seoGuide' &&
            tool.id !== 'hyperLocalSeo' &&
            tool.id !== 'neighborhoodSniper' &&
            tool.id !== 'authorityBuilder' &&
            tool.id !== 'competitorIntel' &&
            tool.id !== 'analytics' &&
            tool.id !== 'roiCalculator' &&
            tool.id !== 'roadmap' &&
            tool.id !== 'offlineMarketing' &&
            tool.id !== 'unfairAdvantage' &&
            tool.id !== 'library'
          ).map(tool => (
            <div
              key={tool.id}
              className="tool-card bg-white text-slate-900 rounded-2xl p-8 shadow-xl cursor-pointer border-4 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col"
              onClick={() => openModal(tool.id)}
            >
              <div className="text-5xl mb-4">{tool.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-green-700">{tool.title}</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">{tool.description}</p>
              <div className="p-3 rounded-lg text-sm border-l-4 bg-green-100 text-green-900 border-green-500 mb-4">
                {tool.why}
              </div>
              <button className="btn w-full mt-auto pt-6 text-white py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-green-600 to-green-700">
                {tool.id === 'weekContent' ? '🔥 Generate Week of Content' : 'Open Tool'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: MY CONTENT LIBRARY */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center justify-center mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent flex-1"></div>
          <h2 className="text-2xl font-bold text-purple-400 px-6 flex items-center gap-3">
            📚 MY CONTENT LIBRARY
            <span className="text-sm font-normal text-purple-300">(Saved Content)</span>
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent flex-1"></div>
        </div>

        <div className="max-w-2xl mx-auto">
          {tools.filter(tool => tool.id === 'library').map(tool => (
            <div
              key={tool.id}
              className="tool-card bg-white text-slate-900 rounded-2xl p-8 shadow-xl cursor-pointer border-4 border-purple-500 bg-gradient-to-br from-purple-50 to-fuchsia-50"
              onClick={() => openModal(tool.id)}
            >
              <div className="text-5xl mb-4 text-center">{tool.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-purple-700 text-center">{tool.title}</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed text-center">{tool.description}</p>
              <div className="p-3 rounded-lg text-sm border-l-4 bg-purple-100 text-purple-900 border-purple-500">
                {tool.why}
              </div>
              <button className="btn w-full mt-6 text-white py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-purple-700">
                📚 Open Library
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-700 text-center">
        <div className="mb-4">
          <span className="text-xl font-bold text-blue-400">⚡</span>
          <span className="text-xl font-bold ml-1">Operate</span>
          <span className="text-xl font-bold text-blue-400">AI</span>
        </div>
        <p className="text-slate-400 text-sm mb-2">Built for Home Service Professionals</p>
        <p className="text-slate-500 text-xs">© 2025 OperateAI. All rights reserved.</p>
        <p className="text-slate-500 text-xs mt-2">Questions? Contact: hello@operateai.ai</p>
      </div>

      {/* WEEKLY EXECUTION ROADMAP MODAL */}
      {activeModal === 'roadmap' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-5xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">📋 THE 30-DAY DOMINATION ROADMAP</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-xl mb-6 border-2 border-orange-500">
              <h3 className="text-orange-900 font-bold text-2xl mb-3">90 Minutes a Week to Unstoppable Local Authority</h3>
              <div className="bg-white/70 p-4 rounded-lg mb-3">
                <p className="text-orange-900 leading-relaxed">
                  <strong>🎯 THE GUARANTEE:</strong> Follow this system exactly for 90 days. You aren't just "posting content"—you are <strong>engineering a local monopoly.</strong> Every tool in this dashboard has a specific job. This roadmap tells you <strong>exactly when to use each one.</strong>
                </p>
              </div>
              <div className="bg-white/70 p-4 rounded-lg">
                <p className="text-orange-900 font-bold mb-2">⏱️ WEEKLY TIME BREAKDOWN:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-orange-800">
                  <div>• Daily: 15 min</div>
                  <div>• Monday: 60 min</div>
                  <div>• Tuesday: 30 min</div>
                  <div>• Wednesday: 35 min</div>
                  <div>• Thursday: 40 min</div>
                  <div>• Friday: 45 min</div>
                  <div>• Weekend: 20 min</div>
                  <div>• After Jobs: 10 min</div>
                </div>
                <p className="text-orange-900 font-bold mt-2">= ~3.5 hrs/week + job pipeline time</p>
                <p className="text-orange-800 text-xs mt-1">💡 That's 30 min/day to outrank every competitor in your market. Most business owners waste 30 min scrolling — invest it instead.</p>
              </div>
            </div>

            {/* TOOL LEGEND */}
            <div className="bg-slate-800 p-5 rounded-xl mb-6 border-2 border-slate-600">
              <h3 className="text-white font-bold text-lg mb-3">🧰 YOUR TOOL ARSENAL — Every Module Has a Job</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-red-400">🏘️ Neighborhood Sniper</strong> — Find leads before they search Google</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-blue-400">📍 Google Business Post Optimizer</strong> — Create SEO-optimized Google posts</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-green-400">📸 Before/After Story Generator</strong> — Turn job photos into proof posts</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-purple-400">💡 Daily Tip Generator</strong> — Educational posts that build trust</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-yellow-400">⭐ Review Maximizer</strong> — Convert happy customers into 5-star reviews</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-orange-400">🎬 Video Script Command Center</strong> — Scripts for short-form video</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-cyan-400">🕵️ Competitor Intel</strong> — Spy on competitors, steal their playbook</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-pink-400">💬 Objection Handler</strong> — Close deals and save relationships</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-emerald-400">🛡️ Authority Builder</strong> — Become the AI-recommended expert</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-amber-400">❓ FAQ/Website Content Generator</strong> — SEO pages that rank</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-lime-400">🥷 Guerrilla Marketing</strong> — $0-cost offline domination</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-indigo-400">📊 Analytics Dashboard</strong> — Track what's working, kill what isn't</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-rose-400">⚡ Weather Alert Posts</strong> — Urgency posts that spike calls</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-teal-400">📧 Email Campaign Builder</strong> — Reactivate past customers</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-orange-400">🎯 Seasonal Campaign Builder</strong> — Full multi-channel campaign in one click</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-sky-400">🔥 One Job = One Week of Content</strong> — 7 posts from 1 job</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-violet-400">🔄 Job Pipeline</strong> — Post-job marketing in 10 min</div>
                <div className="bg-white/10 p-2 rounded text-slate-200"><strong className="text-fuchsia-400">🚀 Unfair Advantage Guide</strong> — Zero-competition lead platforms</div>
              </div>
            </div>

            {/* YOUR WINS THIS WEEK */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-6 border-2 border-green-500">
              <h3 className="text-green-900 font-bold text-xl mb-3">📊 YOUR WINS THIS WEEK</h3>
              <p className="text-green-800 text-sm mb-4">Track your wins! Check these off as you achieve them:</p>

              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-green-50">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-slate-800">📞 Got 3+ calls from GBP this week</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-green-50">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-slate-800">💾 Got 5+ saves on Facebook this week</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-green-50">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-slate-800">🏘️ Got 1+ Nextdoor inquiry this week</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-green-50">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-slate-800">🎬 Filmed and posted 1 short-form video this week</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-green-50">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-slate-800">✅ Completed all 5 daily habit phases every day this week</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-green-50">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-slate-800">⭐ Responded to ALL reviews within 24 hours this week</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-green-50">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-slate-800">🔍 Seeded GBP Q&A questions this week (SEO boost!)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-green-50">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-slate-800">🥷 Completed 1 offline guerrilla move this week</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-green-50">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-slate-800">📊 Completed weekend analytics check</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-gradient-to-r from-indigo-100 to-purple-100 p-3 rounded-lg hover:from-indigo-200 hover:to-purple-200 border-2 border-indigo-500">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-slate-800 font-semibold">📈 MONTH-END: Completed Saturday 60 analytics deep-dive</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-lg hover:from-green-200 hover:to-emerald-200 border-2 border-green-600">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-slate-800 font-semibold">📝 MONTH-END: Published blog post + FAQ page this month</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-gradient-to-r from-orange-100 to-amber-100 p-3 rounded-lg hover:from-orange-200 hover:to-amber-200 border-2 border-orange-600">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-slate-800 font-semibold">🔍 MONTH-END: Verified NAP consistency across all platforms</span>
                </label>
              </div>

              <div className="mt-4 p-4 bg-yellow-100 rounded-lg border-l-4 border-yellow-500">
                <p className="text-yellow-900 font-bold">✨ MILESTONE TRACKER:</p>
                <p className="text-yellow-800 text-sm mt-1">Complete all tasks 4 weeks in a row = CONSISTENCY UNLOCKED! 🔥</p>
                <p className="text-yellow-800 text-sm">First video posted = AUTHORITY BUILDER! 🎬</p>
                <p className="text-yellow-800 text-sm">First blog post live = ANSWER ENGINE ACTIVATED! 📝</p>
                <p className="text-yellow-800 text-sm">Monthly analytics review = DATA-DRIVEN OPTIMIZATION! 📊</p>
              </div>
            </div>

            {/* NEVER FORGET - REMINDERS */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl mb-6 border-2 border-purple-500">
              <h3 className="text-purple-900 font-bold text-xl mb-3">🔔 NEVER FORGET A TASK!</h3>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Calendar Download */}
                <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                  <h4 className="font-bold text-purple-700 mb-2">📅 Calendar Reminders</h4>
                  <p className="text-sm text-slate-700 mb-3">
                    Download your personalized marketing calendar. Add it to your phone/computer calendar and get native reminders!
                  </p>
                  <button
                    onClick={() => {
                      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OperateAI Marketing Suite//Roadmap Calendar//EN
CALNAME:30-Day Domination Roadmap
X-WR-CALNAME:30-Day Domination Roadmap
X-WR-TIMEZONE:America/New_York
BEGIN:VEVENT
DTSTART:20260202T080000
DTEND:20260202T081500
RRULE:FREQ=DAILY
SUMMARY:☀️ Morning Domination Habits (15 min)
DESCRIPTION:📍 Daily Geo Check-In (1 min) — Monday: include Apple Showcase upload\\n🎯 Signal Search - Groups Watcher/Devi AI (2 min)\\n🥇 Educational First Response if lead found (1 min)\\n⚡ Weather Scan - check 5-day forecast (1 min)\\n📱 After Post: Share to Stories + DM 2-3 people + Reply in 60 min\\n🌙 End of Day: Answer all DMs + Reply to reviews + Sweep comments
END:VEVENT
BEGIN:VEVENT
DTSTART:20260202T090000
DTEND:20260202T100000
RRULE:FREQ=WEEKLY;BYDAY=MO
SUMMARY:📘 MONDAY: Authority + Content Creation (60 min)
DESCRIPTION:📍 GBP Landmark Hack Post (10 min)\\n📘 Facebook Before/After OR Tip Post (15 min)\\n📍 GBP Q&A - Seed Strategic Questions (10 min)\\n🎬 Write This Week's Video Script (10 min)\\n🕵️ Competitor Quick-Check - Facebook Ad Library (Meta) (5 min)\\n\\nTools: Google Business Post Optimizer, Before/After Generator, Video Script Command Center, Competitor Intel
END:VEVENT
BEGIN:VEVENT
DTSTART:20260203T090000
DTEND:20260203T093000
RRULE:FREQ=WEEKLY;BYDAY=TU
SUMMARY:🎬 TUESDAY: Video + Nextdoor + Outreach (30 min)
DESCRIPTION:🎬 Film + Post Short-Form Video (15 min)\\n🏘️ Nextdoor Educational Tip Post (5 min)\\n🤝 Tag-Team Partner Outreach (5 min)\\n👥 Facebook Follower Growth - invite commenters (5 min)\\n\\nTools: Video Script Command Center, Daily Tip Generator, Neighborhood Sniper
END:VEVENT
BEGIN:VEVENT
DTSTART:20260204T090000
DTEND:20260204T093500
RRULE:FREQ=WEEKLY;BYDAY=WE
SUMMARY:📍 WEDNESDAY: Hyper-Local SEO + Visual Proof (35 min)
DESCRIPTION:📍 GBP Landmark Photo Upload - 3 geotagged (10 min)\\n📘 Facebook/IG Diagnostic Map Post (10 min)\\n📸 Yelp Photo Upload + Review Responses (5 min)\\n🏘️ Nextdoor Recommendation Thank-You Sweep (5 min)\\n🔗 Cross-Post to Additional Platforms (5 min)\\n🍎 Apple Business Showcase Photo (2 min)\\n\\nTools: Hyper-Local SEO, Before/After Generator, Authority Builder, Unfair Advantage Guide
END:VEVENT
BEGIN:VEVENT
DTSTART:20260205T090000
DTEND:20260205T093000
RRULE:FREQ=WEEKLY;BYDAY=TH
SUMMARY:📝 THURSDAY: Authority Building + Email (40 min)
DESCRIPTION:📝 Blog Post OR FAQ Page - bi-weekly (20 min)\\n📧 Email Campaign/Newsletter - bi-weekly (10 min)\\n📄 Neighborhood Landing Page Progress (10 min)\\n\\nTools: Authority Builder, FAQ Generator, Email Campaign Builder, Seasonal Campaign Builder, Hyper-Local SEO
END:VEVENT
BEGIN:VEVENT
DTSTART:20260206T090000
DTEND:20260206T094500
RRULE:FREQ=WEEKLY;BYDAY=FR
SUMMARY:⭐ FRIDAY: Reviews + Reputation + Guerrilla (45 min)
DESCRIPTION:⭐ Pre-Review Qualifier - text last 3 customers (5 min)\\n⭐ SEO Review Reply Sweep - all platforms (10 min)\\n📘 Facebook Review Social Proof Post (10 min)\\n🥷 Guerrilla Move of the Week - rotate weekly (15 min)\\n📆 Plan Next Week's Content (5 min)\\n\\nTools: Review Maximizer, Guerrilla Marketing, 30-Day Calendar
END:VEVENT
BEGIN:VEVENT
DTSTART:20260207T100000
DTEND:20260207T102000
RRULE:FREQ=WEEKLY;BYDAY=SA
SUMMARY:📊 WEEKEND: Analytics + Strategy (20 min)
DESCRIPTION:📊 Big 5 Scan - Calls, Forms, Directions, Velocity, Bookings (5 min)\\n📘 Facebook Top Post + Engagement Check (5 min)\\n🚩 Red Flag Check (5 min)\\n📝 Write Down 1-2 Wins (5 min)\\n\\nTools: Analytics Dashboard Guide
END:VEVENT
BEGIN:VEVENT
DTSTART:20260228T100000
DTEND:20260228T112000
RRULE:FREQ=MONTHLY;BYDAY=-1SA
SUMMARY:📊 SATURDAY 60 — Monthly Deep-Dive (~80 min)
DESCRIPTION:📝 Monthly Data Audit (15 min)\\n🤖 AI Answer Engine Audit - ask ChatGPT/Gemini who they recommend (10 min)\\n📧 Database Reactivation Text - 10 past customers (15 min)\\n🕵️ Competitor Deep-Dive - Ad Library + reviews + AI citations (10 min)\\n📍 NAP + Zip Code Sweep (10 min)\\n🔎 Stealth Monopoly Audit - Siri + AI + Home Depot (10 min)\\n📍 Bing/AI Sync - Update Bing Places from Google (5 min)\\n💬 WhatsApp Channel Monthly Broadcast (5 min)\\n\\nTools: Analytics Dashboard, Website SEO Guide, Competitor Intel, Hyper-Local SEO, Unfair Advantage Guide
END:VEVENT
END:VCALENDAR`;

                      const blob = new Blob([icsContent], { type: 'text/calendar' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'market-domination-roadmap.ics';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-bold hover:from-purple-700 hover:to-purple-800 text-lg"
                  >
                    📥 Download Full Calendar (.ics)
                  </button>
                  <p className="text-xs text-slate-500 mt-2">
                    ✓ Works with iPhone, Android, Google Calendar, Outlook<br/>
                    ✓ All 5 weekdays + weekend + monthly Saturday 60<br/>
                    ✓ One-time setup, reminders forever!
                  </p>
                </div>

                {/* Quick Reference Card */}
                <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                  <h4 className="font-bold text-purple-700 mb-2">🖨️ Printable Weekly Checklist</h4>
                  <p className="text-sm text-slate-700 mb-3">
                    Print this quick-reference card and tape it next to your desk. Check off tasks as you go!
                  </p>
                  <button
                    onClick={() => {
                      const printContent = `
<!DOCTYPE html>
<html><head><title>Market Domination Weekly Checklist</title>
<style>
body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;font-size:12px}
h1{text-align:center;font-size:20px;margin-bottom:5px}
h2{font-size:14px;margin:12px 0 6px;padding:6px 10px;color:white;border-radius:6px}
.blue{background:#2563eb}.teal{background:#0d9488}.green{background:#16a34a}.amber{background:#d97706}.purple{background:#7c3aed}.orange{background:#ea580c}.red{background:#dc2626}
.task{display:flex;align-items:flex-start;gap:8px;padding:4px 0;border-bottom:1px dotted #ddd}
.task input{margin-top:2px}
.daily{background:#fef2f2;padding:8px;border-radius:6px;margin-bottom:10px;border-left:4px solid #dc2626}
.subtitle{font-size:10px;color:#666;text-align:center;margin-bottom:15px}
@media print{body{padding:10px}}
</style></head><body>
<h1>📋 MARKET DOMINATION — WEEKLY CHECKLIST</h1>
<p class="subtitle">Week of: _____________ | OperateAI Marketing Suite</p>

<div class="daily">
<strong>🔄 DAILY (Every Day — 15 min):</strong><br>
<div class="task"><input type="checkbox"> ☀️ Morning: Geo Photo + Signal Search + Weather Scan (5 min)</div>
<div class="task"><input type="checkbox"> 📱 After Post: Share to Stories + DM 2-3 people + Reply in 60 min (5 min)</div>
<div class="task"><input type="checkbox"> 🌙 End of Day: All DMs answered + Reviews replied + Comments swept (5 min)</div>
</div>

<h2 class="blue">📘 MONDAY — Authority + Content Creation (60 min)</h2>
<div class="task"><input type="checkbox"> 📍 GBP Landmark Hack Post + Apple Showcase upload (10 min)</div>
<div class="task"><input type="checkbox"> 📘 Facebook Before/After OR Tip Post — post at 6-9pm (15 min)</div>
<div class="task"><input type="checkbox"> 📍 GBP Q&A — Seed strategic questions with zip codes (10 min)</div>
<div class="task"><input type="checkbox"> 🎬 Write this week's video script (10 min)</div>
<div class="task"><input type="checkbox"> 🕵️ Competitor Quick-Check — Facebook Ad Library (Meta) + reviews (5 min)</div>

<h2 class="teal">🎬 TUESDAY — Video + Nextdoor + Outreach (30 min)</h2>
<div class="task"><input type="checkbox"> 🎬 Film + post short-form video (Reel/Short) (15 min)</div>
<div class="task"><input type="checkbox"> 🏘️ Nextdoor educational tip post (5 min)</div>
<div class="task"><input type="checkbox"> 🤝 Tag-Team partner outreach — text/call 1 partner (5 min)</div>
<div class="task"><input type="checkbox"> 👥 Facebook follower growth — invite commenters (5 min)</div>

<h2 class="green">📍 WEDNESDAY — Hyper-Local SEO + Visual Proof (35 min)</h2>
<div class="task"><input type="checkbox"> 📍 GBP Landmark Photo Upload — 3 geotagged photos (10 min)</div>
<div class="task"><input type="checkbox"> 📘 Facebook/IG Diagnostic Map post (10 min)</div>
<div class="task"><input type="checkbox"> 📸 Yelp photo upload + review responses (5 min)</div>
<div class="task"><input type="checkbox"> 🏘️ Nextdoor recommendation thank-you sweep (5 min)</div>
<div class="task"><input type="checkbox"> 🔗 Cross-post to additional platforms (5 min)</div>
<div class="task"><input type="checkbox"> 🍎 Apple Business Showcase photo upload (2 min)</div>

<h2 class="amber">📝 THURSDAY — Authority Building + Email (40 min)</h2>
<div class="task"><input type="checkbox"> 📝 Blog Post OR FAQ Page (bi-weekly) (20 min)</div>
<div class="task"><input type="checkbox"> 📧 Email campaign / newsletter (bi-weekly) (10 min)</div>
<div class="task"><input type="checkbox"> 📄 Neighborhood landing page progress (10 min)</div>

<h2 class="purple">⭐ FRIDAY — Reviews + Reputation + Guerrilla (45 min)</h2>
<div class="task"><input type="checkbox"> ⭐ Pre-Review Qualifier — text last 3 customers (5 min)</div>
<div class="task"><input type="checkbox"> ⭐ SEO Review Reply Sweep — all platforms (10 min)</div>
<div class="task"><input type="checkbox"> 📘 Facebook review social proof post (10 min)</div>
<div class="task"><input type="checkbox"> 🥷 Guerrilla Move of the Week (15 min)</div>
<div class="task"><input type="checkbox"> 📆 Plan next week's content (5 min)</div>

<h2 class="orange">📊 WEEKEND — Analytics + Strategy (20 min)</h2>
<div class="task"><input type="checkbox"> 📊 Big 5 Scan — Calls, Forms, Directions, Velocity, Bookings (5 min)</div>
<div class="task"><input type="checkbox"> 📘 Facebook top post + engagement check (5 min)</div>
<div class="task"><input type="checkbox"> 🚩 Red Flag Check (5 min)</div>
<div class="task"><input type="checkbox"> 📝 Write down 1-2 wins (5 min)</div>

<hr style="margin:15px 0;border:2px solid #16a34a">
<p style="text-align:center;font-weight:bold;font-size:14px">🔥 Total: ~3.5 hrs/week = 30 min/day to outrank every competitor in your zip code</p>
<hr style="margin:10px 0;border:1px dashed #7c3aed">
<p style="text-align:center;font-size:11px;color:#7c3aed"><strong>📊 LAST SATURDAY OF THE MONTH:</strong> The "Saturday 60" Deep-Dive (~80 min) — Data Audit + AI Check + Competitor Sweep + Bing Sync + NAP Check + WhatsApp Broadcast</p>
<p style="text-align:center;font-size:11px;color:#ea580c"><strong>🎯 QUARTERLY (Mar/Jun/Sep/Dec):</strong> Run the Seasonal Campaign Builder — full multi-channel campaign (emails + social + flyer + texts + GBP + checklist) in one click</p>
</body></html>`;
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(printContent);
                      printWindow.document.close();
                      printWindow.print();
                    }}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 px-4 rounded-lg font-bold hover:from-pink-700 hover:to-rose-700 text-lg"
                  >
                    🖨️ Print Weekly Checklist
                  </button>
                  <p className="text-xs text-slate-500 mt-2">
                    ✓ One-page printable with all daily + weekly tasks<br/>
                    ✓ Checkboxes for every task<br/>
                    ✓ Tape it to your dashboard or desk!
                  </p>
                </div>
              </div>
            </div>

            {/* ═══════════════ DAILY ═══════════════ */}
            <details className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl mb-4 border-2 border-red-500" open>
              <summary className="font-bold text-xl text-red-900 cursor-pointer mb-3 hover:text-red-700">
                🔄 THE DAILY "DOMINATION" HABITS (15 min total) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                  <p className="font-bold text-red-800">Three phases every day. Morning finds leads. After-Post feeds the algorithm. End-of-Day protects your reputation. <strong>Every single task sends a geo signal, engagement signal, or trust signal to Google.</strong></p>
                </div>

                {/* ═══ PHASE 1: MORNING (Before Work / Coffee) ═══ */}
                <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-4 rounded-lg border-2 border-orange-400">
                  <p className="font-bold text-orange-900 text-lg mb-3">☀️ PHASE 1: MORNING — Find Leads + Send Geo Signal (5 min)</p>

                  <div className="space-y-3">
                    {/* Daily Geo Check-In */}
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500">
                      <span className="text-2xl">☐</span>
                      <div>
                        <p className="font-bold text-green-800">📍 Daily Geo Check-In (1 min) <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full ml-1">NON-NEGOTIABLE</span></p>
                        <p className="text-sm text-slate-700">Upload <strong>one geotagged photo</strong> to GBP, Instagram Story, or Facebook Story. Rotate by day:</p>
                        <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs">
                          <span className="bg-blue-50 px-2 py-1 rounded text-blue-800"><strong>M:</strong> Landmark + GBP + Apple Showcase</span>
                          <span className="bg-blue-50 px-2 py-1 rounded text-blue-800"><strong>T:</strong> Job site + IG Story</span>
                          <span className="bg-blue-50 px-2 py-1 rounded text-blue-800"><strong>W:</strong> Landmark + GBP/ND</span>
                          <span className="bg-blue-50 px-2 py-1 rounded text-blue-800"><strong>Th:</strong> Q&A zip + GBP</span>
                          <span className="bg-blue-50 px-2 py-1 rounded text-blue-800"><strong>F:</strong> Truck shot + GBP/ND</span>
                          <span className="bg-blue-50 px-2 py-1 rounded text-blue-800"><strong>Sa:</strong> Community + Stories</span>
                          <span className="bg-blue-50 px-2 py-1 rounded text-blue-800"><strong>Su:</strong> Prep shot + GBP</span>
                        </div>
                        <p className="text-xs text-purple-700 mt-1"><strong>🍎 Monday CarPlay Hack:</strong> Upload your Monday landmark photo to <strong>Apple Business Connect Showcases</strong> so CarPlay users see you on their dashboard commute. Takes 30 seconds — wins the entire Siri market.</p>
                        <p className="text-xs text-green-700 mt-1"><strong>🔧 Tools:</strong> <strong>📍 Hyper-Local SEO</strong> → Landmark Cheat Sheet | <strong>📍 Google Business Post Optimizer</strong> → neighborhood tags</p>
                      </div>
                    </div>

                    {/* Signal Search */}
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-red-400">
                      <span className="text-2xl">☐</span>
                      <div>
                        <p className="font-bold text-red-800">🎯 Signal Search — Facebook Groups + Nextdoor (2 min)</p>
                        <p className="text-sm text-slate-700">Check your Groups Watcher / Devi AI alerts for trade-specific <strong>trigger words:</strong></p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">🔧 "Burst" "Clogged" (Plumbing/Restoration)</span>
                          <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">🏠 "Leaking" "Hail" "Roof" (Roofing)</span>
                          <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">🌡️ "No heat" "AC loud" "High bill" (HVAC)</span>
                          <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">⚡ "Flickering" "Sparking" "Tripping" (Electrical)</span>
                          <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">🌳 "Tree down" "Mowing" "Overgrown" (Landscaping)</span>
                        </div>
                        <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🏘️ Neighborhood Sniper</strong> → Signal Search keyword table</p>
                      </div>
                    </div>

                    {/* Educational First Response */}
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-red-400">
                      <span className="text-2xl">☐</span>
                      <div>
                        <p className="font-bold text-red-800">🥇 "Educational First" Response — If Lead Found (1 min)</p>
                        <p className="text-sm text-slate-700"><strong>Don't spam your number.</strong> Give a Micro-Consult + DM. On Nextdoor emergency posts, reply <strong>within 10 minutes</strong> to beat every competitor.</p>
                        <p className="text-sm text-red-700 italic mt-1">"First thing—[shut off your water / flip that breaker / check your filter]. Happy to swing by—DM me!"</p>
                        <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🏘️ Neighborhood Sniper</strong> → Educational First Response scripts</p>
                      </div>
                    </div>

                    {/* Weather Scan */}
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-orange-400">
                      <span className="text-2xl">☐</span>
                      <div>
                        <p className="font-bold text-orange-800">⚡ Weather Scan (1 min)</p>
                        <p className="text-sm text-slate-700">Check 5-day forecast. Storm/freeze/heat wave coming? Deploy an urgency post <strong>today.</strong> Nextdoor's algorithm gives <strong>10x impressions</strong> to "Safety and Urgency" content during weather events.</p>
                        <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>⚡ Weather Alert Urgency Posts</strong> → generates storm urgency content with authority positioning</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ═══ PHASE 2: AFTER EVERY POST ═══ */}
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-lg border-2 border-blue-400">
                  <p className="font-bold text-blue-900 text-lg mb-2">📱 PHASE 2: AFTER EVERY POST — The "60-Minute Engagement Window" (5 min)</p>
                  <p className="text-blue-800 text-xs mb-3">The algorithm decides whether to show your post to more people based on engagement in the <strong>first 60 minutes.</strong> If it dies in the first hour, it stays buried forever. These 4 actions ensure it doesn't.</p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                      <span className="text-2xl">☐</span>
                      <div>
                        <p className="font-bold text-blue-800">📤 Share to Stories Immediately (30 sec)</p>
                        <p className="text-sm text-slate-700">Every feed post → share to Facebook Story AND Instagram Story within 60 seconds. Story clicks back to the post count as engagement signals.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                      <span className="text-2xl">☐</span>
                      <div>
                        <p className="font-bold text-blue-800">📨 The "Seed Boost" — DM 2-3 Past Customers (1 min)</p>
                        <p className="text-sm text-slate-700">Text or DM 2-3 people: <em>"Hey! Just posted about that [job/tip]—thought you'd like to see it!"</em> Their clicks + comments in the first 5 min trigger algorithm favor.</p>
                        <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🚀 Visibility Playbook</strong> → The First-Hour Algorithm Hack</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                      <span className="text-2xl">☐</span>
                      <div>
                        <p className="font-bold text-blue-800">💬 Respond to EVERY Comment Within 60 Min (2-3 min)</p>
                        <p className="text-sm text-slate-700">Set a timer. Each reply counts as <strong>new engagement</strong> → boosts the post in the algorithm. Even <em>"Thanks for the support!"</em> counts. Your reply to a comment is worth more than 5 likes.</p>
                        <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🚀 Visibility Playbook</strong> → Engagement Signals Ranked</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                      <span className="text-2xl">☐</span>
                      <div>
                        <p className="font-bold text-blue-800">🔥 Engagement Question in Every Caption (built-in)</p>
                        <p className="text-sm text-slate-700">End every post with one question: <em>"Have you ever dealt with this?"</em> or <em>"What would you do?"</em> This drives comments without being "engagement bait."</p>
                        <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🔥 One Job = One Week</strong> → auto-generates engagement questions for each post</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ═══ PHASE 3: END OF DAY / BETWEEN JOBS ═══ */}
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-lg border-2 border-purple-400">
                  <p className="font-bold text-purple-900 text-lg mb-2">🌙 PHASE 3: END OF DAY — Protect Reputation + Respond (5 min)</p>
                  <p className="text-purple-800 text-xs mb-3">Taking 24+ hours to reply to a comment signals "inactive account." Google and Facebook both track response time. These habits protect your ranking AND your reputation.</p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-purple-500">
                      <span className="text-2xl">☐</span>
                      <div>
                        <p className="font-bold text-purple-800">📞 Respond to ALL New Messages + DMs (2 min)</p>
                        <p className="text-sm text-slate-700">GBP messages, Facebook DMs, Nextdoor inquiries, Instagram DMs. Reply within 15 min when possible = Facebook's <strong>"Very Responsive"</strong> badge → more trust from new leads.</p>
                        <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>💬 Objection Handler</strong> → if they push back on price, use "Scientific Safety Inspection" pivot</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-purple-500">
                      <span className="text-2xl">☐</span>
                      <div>
                        <p className="font-bold text-purple-800">⭐ Check + Reply to New Google Reviews (1 min)</p>
                        <p className="text-sm text-slate-700">Reply to every new review on Google, Yelp, and Facebook. <strong>Stuff your reply with keywords + neighborhood name:</strong></p>
                        <p className="text-sm text-purple-700 italic mt-1">"Thanks, Sarah! We love being the go-to for <strong>[your service]</strong> in <strong>[Neighborhood Name]</strong>!"</p>
                        <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>⭐ Review Maximizer</strong> → generates keyword-rich review reply (Asset #4)</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-purple-500">
                      <span className="text-2xl">☐</span>
                      <div>
                        <p className="font-bold text-purple-800">💬 Reply to ALL Remaining Post Comments (1 min)</p>
                        <p className="text-sm text-slate-700">Sweep all platforms for comments you missed during the 60-min window. Reply to <strong>every single one.</strong> Each late reply still counts as engagement and shows the algorithm you're active.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-purple-500">
                      <span className="text-2xl">☐</span>
                      <div>
                        <p className="font-bold text-purple-800">🔔 Confirm Notifications Are ON (one-time setup, then daily glance)</p>
                        <p className="text-sm text-slate-700">Ensure push notifications are enabled on:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="bg-purple-100 px-2 py-0.5 rounded text-purple-800 text-xs">📍 GBP App — comments, messages, reviews</span>
                          <span className="bg-purple-100 px-2 py-0.5 rounded text-purple-800 text-xs">📘 Facebook Page — all interactions</span>
                          <span className="bg-purple-100 px-2 py-0.5 rounded text-purple-800 text-xs">🏘️ Nextdoor — mentions + DMs</span>
                          <span className="bg-purple-100 px-2 py-0.5 rounded text-purple-800 text-xs">📸 Instagram — DMs + comments</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">💡 If you don't have notifications on, you'll miss leads. Competitors who respond first win 78% of jobs.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Summary */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-500">
                  <p className="font-bold text-green-900 text-sm mb-2">📊 DAILY SCORECARD — Did You Hit All 3 Phases?</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-white p-2 rounded text-center">
                      <p className="font-bold text-orange-700">☀️ MORNING</p>
                      <p className="text-slate-600">1 Geo Photo</p>
                      <p className="text-slate-600">Signal Search</p>
                      <p className="text-slate-600">Weather Check</p>
                    </div>
                    <div className="bg-white p-2 rounded text-center">
                      <p className="font-bold text-blue-700">📱 AFTER POST</p>
                      <p className="text-slate-600">Share to Stories</p>
                      <p className="text-slate-600">DM 2-3 people</p>
                      <p className="text-slate-600">Reply in 60 min</p>
                    </div>
                    <div className="bg-white p-2 rounded text-center">
                      <p className="font-bold text-purple-700">🌙 END OF DAY</p>
                      <p className="text-slate-600">All DMs answered</p>
                      <p className="text-slate-600">Reviews replied</p>
                      <p className="text-slate-600">Comments swept</p>
                    </div>
                  </div>
                  <p className="text-green-800 text-xs mt-2 text-center"><strong>15 min/day × 365 days = the reason you outrank every competitor in your zip code.</strong></p>
                </div>
              </div>
            </details>

            {/* Weekly Flow Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl mb-4 text-center">
              <h3 className="text-white font-bold text-2xl">📅 THE WEEKLY FLOW</h3>
            </div>

            {/* WEEKLY PHOTO ROTATION SYSTEM */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl mb-4 border-2 border-pink-500">
              <h3 className="text-pink-900 font-bold text-xl mb-2">📸 THE WEEKLY PHOTO ROTATION (Read This First!)</h3>
              <p className="text-pink-800 text-sm mb-4">Every week you need <strong>5 different photos</strong> to feed GBP, Facebook, Nextdoor, and Instagram. Here's the system so you never post the same shot twice:</p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-pink-800 text-white">
                      <th className="p-2 text-left rounded-tl-lg">Photo Type</th>
                      <th className="p-2 text-left">What to Shoot</th>
                      <th className="p-2 text-left">Where It Goes</th>
                      <th className="p-2 text-left rounded-tr-lg">Which Day</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b border-slate-200">
                      <td className="p-2 font-bold text-blue-800">📍 Landmark Shot</td>
                      <td className="p-2 text-slate-700">Your truck near a school, park, plaza, or local business from your Cheat Sheet</td>
                      <td className="p-2"><span className="bg-red-100 px-1.5 py-0.5 rounded text-red-800 font-bold">GBP</span></td>
                      <td className="p-2 font-bold text-blue-700">Wednesday</td>
                    </tr>
                    <tr className="bg-pink-50 border-b border-slate-200">
                      <td className="p-2 font-bold text-green-800">🔬 Diagnostic Tool</td>
                      <td className="p-2 text-slate-700">Thermal camera screen, moisture meter reading, pressure gauge, drone macro shot</td>
                      <td className="p-2"><span className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 font-bold">Facebook</span> <span className="bg-purple-100 px-1.5 py-0.5 rounded text-purple-800 font-bold">Instagram</span></td>
                      <td className="p-2 font-bold text-green-700">Wednesday</td>
                    </tr>
                    <tr className="bg-white border-b border-slate-200">
                      <td className="p-2 font-bold text-orange-800">📸 Before / After</td>
                      <td className="p-2 text-slate-700">Side-by-side: the mess vs. the masterpiece. Include the "Scientific Overlay" if possible</td>
                      <td className="p-2"><span className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 font-bold">Facebook</span> <span className="bg-red-100 px-1.5 py-0.5 rounded text-red-800 font-bold">GBP</span></td>
                      <td className="p-2 font-bold text-blue-700">Monday</td>
                    </tr>
                    <tr className="bg-pink-50 border-b border-slate-200">
                      <td className="p-2 font-bold text-purple-800">🚛 Organized Truck</td>
                      <td className="p-2 text-slate-700">Back doors OPEN showing organized equipment. "Ready-for-war" shot. Park at busiest street.</td>
                      <td className="p-2"><span className="bg-green-100 px-1.5 py-0.5 rounded text-green-800 font-bold">Nextdoor</span> <span className="bg-red-100 px-1.5 py-0.5 rounded text-red-800 font-bold">GBP</span></td>
                      <td className="p-2 font-bold text-purple-700">Friday</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2 font-bold text-cyan-800 rounded-bl-lg">👷 Team / Action</td>
                      <td className="p-2 text-slate-700">Your crew at work (shoe covers on, floor protection visible, safety gear). The "Un-copyable" photo.</td>
                      <td className="p-2"><span className="bg-purple-100 px-1.5 py-0.5 rounded text-purple-800 font-bold">Instagram</span> <span className="bg-green-100 px-1.5 py-0.5 rounded text-green-800 font-bold">Nextdoor</span></td>
                      <td className="p-2 font-bold text-cyan-700 rounded-br-lg">After Jobs</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border-l-4 border-pink-500">
                  <p className="text-pink-800 text-xs font-bold">📱 The 4-Week Rotation for Nextdoor:</p>
                  <div className="mt-1 space-y-0.5">
                    <p className="text-slate-600 text-xs"><strong>Week 1:</strong> Educational Tip + Organized Truck photo</p>
                    <p className="text-slate-600 text-xs"><strong>Week 2:</strong> "Neighbor Heads-Up" post + Landmark Shot</p>
                    <p className="text-slate-600 text-xs"><strong>Week 3:</strong> Before/After Story + Team Action photo</p>
                    <p className="text-slate-600 text-xs"><strong>Week 4:</strong> Seasonal Warning + Diagnostic Tool photo</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border-l-4 border-red-500">
                  <p className="text-red-800 text-xs font-bold">📍 The 4-Week Rotation for GBP:</p>
                  <div className="mt-1 space-y-0.5">
                    <p className="text-slate-600 text-xs"><strong>Week 1:</strong> Before/After + Landmark from Cheat Sheet Spot #1</p>
                    <p className="text-slate-600 text-xs"><strong>Week 2:</strong> Diagnostic Tool + Landmark from Cheat Sheet Spot #2</p>
                    <p className="text-slate-600 text-xs"><strong>Week 3:</strong> Team Action + Landmark from Cheat Sheet Spot #3</p>
                    <p className="text-slate-600 text-xs"><strong>Week 4:</strong> Organized Truck + Landmark from Cheat Sheet Spot #4</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500 mt-3">
                <p className="text-yellow-800 text-xs"><strong>💡 The Golden Rule:</strong> Never post the same photo to GBP and Facebook on the same day. Google wants <strong>unique content per platform.</strong> The rotation above ensures every platform gets fresh, different proof every single week.</p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 mt-2">
                <p className="text-blue-800 text-xs"><strong>🔧 TOOL SYNC:</strong> After every job, use <strong>🔄 Job Pipeline</strong> to generate a blog post, social post, and review request from one job in 10 minutes. Use <strong>📸 Before/After Story Generator</strong> for photo captions and alt-text. Use <strong>📍 Hyper-Local SEO → Landmark Cheat Sheet</strong> to rotate through your 5 landmarks so Google sees you active across your entire service area.</p>
              </div>
            </div>

            {/* ═══════════════ MONDAY ═══════════════ */}
            <details className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-blue-500">
              <summary className="font-bold text-xl text-blue-900 cursor-pointer mb-3 hover:text-blue-700">
                MONDAY: Authority + Content Creation Day (60 min) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800 text-sm">Monday is your biggest content day. You create the posts, scripts, and pages that fuel the rest of the week.</p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-blue-800">📍 GBP Post — The "Landmark Hack" Post (10 min)</p>
                    <p className="text-sm text-slate-700">Create a Google Business post using a <strong>local landmark + environmental factor</strong> for your trade:</p>
                    <p className="text-sm text-slate-600 italic mt-1">🌡️ "Replacing 20-year-old system near [High School]..." | ⚡ "Bringing historic home up to code near [Landmark]..." | 🏠 "Storm-rated roof near [Park]..."</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>📍 Google Business Post Optimizer</strong> → prompts "Which landmark?" + "What environmental factor?"</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-blue-800">📘 Facebook — Before/After OR Educational Tip (15 min)</p>
                    <p className="text-sm text-slate-700">Completed a job last week? → Post <strong>Before/After with Diagnostic Map photo</strong>. No recent job? → Post an <strong>Educational Tip.</strong></p>
                    <p className="text-sm text-slate-600 mt-1">Post at <strong>6-9pm</strong> when homeowners are scrolling. Share to Facebook Story immediately after posting.</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tools:</strong> <strong>📸 Before/After Story Generator</strong> (Scientific Overlay) OR <strong>💡 Daily Tip Generator</strong></p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-blue-800">📍 GBP Q&A — Seed Strategic Questions (10 min)</p>
                    <p className="text-sm text-slate-700">Post a question to your own GBP and answer it with keywords + zip codes:</p>
                    <p className="text-sm text-slate-600 italic">"Do you serve [Wealthy Zip Code]?" → "Yes! We are currently active in [Zip Code] and [Neighborhood Name]..."</p>
                    <p className="text-xs text-yellow-700 mt-1">💡 Q&A shows in Google search results and feeds the AI answer engine!</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-blue-800">🎬 Write This Week's Video Script (10 min)</p>
                    <p className="text-sm text-slate-700">Generate 1 short-form video script to film later this week. Rotate themes:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-800 text-xs">Week 1: Before/After Reveal</span>
                      <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-800 text-xs">Week 2: "Scare-to-Repair" Hook</span>
                      <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-800 text-xs">Week 3: Customer Testimonial</span>
                      <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-800 text-xs">Week 4: "Day in the Life"</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🎬 Video Script Command Center</strong> → Script #8: "3-Second Pattern Interrupt" for maximum retention</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-blue-800">🕵️ Competitor Quick-Check (5 min)</p>
                    <p className="text-sm text-slate-700">Scan <strong>Facebook Ad Library (Meta)</strong> — see what competitors are spending on this week. Check their latest Google reviews for weak spots.</p>
                    <p className="text-sm text-blue-700 mt-1">💡 If they offer "Free Quote," you offer <strong>"30-Point Scientific Diagnostic."</strong></p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🕵️ Competitor Intel</strong> → Shopping List + AI Overview Spy</p>
                  </div>
                </div>
              </div>
            </details>

            {/* ═══════════════ TUESDAY ═══════════════ */}
            <details className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl mb-4 border-2 border-teal-500">
              <summary className="font-bold text-xl text-teal-900 cursor-pointer mb-3 hover:text-teal-700">
                TUESDAY: Video + Nextdoor + Outreach Day (30 min) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-teal-500">
                  <p className="font-bold text-teal-800 text-sm">Tuesday is your "relationship" day — video builds trust, Nextdoor builds neighborhood authority, and partner outreach builds your referral machine.</p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-teal-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-teal-800">🎬 Film + Post This Week's Video (15 min)</p>
                    <p className="text-sm text-slate-700">Using Monday's script, film a <strong>30-60 second vertical video</strong> (9:16 ratio). Post to:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="bg-teal-100 px-2 py-0.5 rounded text-teal-800 text-xs">📘 Facebook Reel</span>
                      <span className="bg-teal-100 px-2 py-0.5 rounded text-teal-800 text-xs">📸 Instagram Reel</span>
                      <span className="bg-teal-100 px-2 py-0.5 rounded text-teal-800 text-xs">▶️ YouTube Short</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Videos watched 50%+ get massive algorithm boost. Hook in the first 1.5 seconds or the algorithm kills it.</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🎬 Video Script Command Center</strong> → Script #8: "3-Second Pattern Interrupt" hook</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-teal-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-teal-800">🏘️ Nextdoor — Educational Tip Post (5 min)</p>
                    <p className="text-sm text-slate-700">Post a helpful seasonal tip. <strong>Be helpful FIRST — never sell on Nextdoor.</strong> Limit sales posts to 1x every 2-3 weeks.</p>
                    <p className="text-sm text-slate-600 mt-1">🔧 "This $5 part prevents a $500 repair" | ⚡ "3 signs your panel needs an upgrade" | 🌡️ "Why your electric bill spikes in [Season]"</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>💡 Daily Tip Generator</strong> (Preventive Maintenance or Cost-Saving Tips)</p>
                    <p className="text-xs text-orange-700 mt-1"><strong>🎯 Seasonal Push:</strong> When it's time for a seasonal promotion, use the <strong>🎯 Seasonal Campaign Builder</strong> — it generates Nextdoor-specific posts with the neighborly tone that actually works on this platform.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-teal-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-teal-800">🤝 Tag-Team Partner Outreach (5 min)</p>
                    <p className="text-sm text-slate-700">Text or call one partner from your referral network this week. Rotate:</p>
                    <div className="mt-1 space-y-0.5">
                      <p className="text-xs text-slate-600">⚡ Electricians → Solar reps, hot tub dealers, EV charger installers</p>
                      <p className="text-xs text-slate-600">🏠 Roofers → Gutter cleaners, window washers, painters</p>
                      <p className="text-xs text-slate-600">🌡️ HVAC → Insulation contractors, duct cleaners, home inspectors</p>
                      <p className="text-xs text-slate-600">🔧 Plumbing → Realtors, property managers, restoration companies</p>
                    </div>
                    <p className="text-sm text-teal-700 italic mt-1">"Hey [Name], just checking in—got any customers who mentioned needing [your service]? I've got a referral for you too."</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🏘️ Neighborhood Sniper</strong> → Stealth Tag-Team Strategy</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-teal-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-teal-800">👥 Facebook Follower Growth (5 min)</p>
                    <p className="text-sm text-slate-700">Invite people who <strong>liked or commented</strong> on your posts this week to follow your page. Check mutual friends in local groups.</p>
                    <p className="text-xs text-slate-600 mt-1">More followers = more organic reach for every post. This is the only platform where followers matter for business pages.</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🚀 Visibility Playbook</strong> → Facebook Follower Growth Strategy</p>
                  </div>
                </div>
              </div>
            </details>

            {/* ═══════════════ WEDNESDAY ═══════════════ */}
            <details className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl mb-4 border-2 border-green-500">
              <summary className="font-bold text-xl text-green-900 cursor-pointer mb-3 hover:text-green-700">
                WEDNESDAY: Hyper-Local SEO + Visual Proof Day (35 min) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800 text-sm">Wednesday is your "proof" day — flood Google with geotagged photos, scientific evidence, and platform-specific content that proves you dominate this area.</p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-green-800">📍 GBP — Landmark Photo Upload (10 min)</p>
                    <p className="text-sm text-slate-700">Upload <strong>3 geotagged photos</strong> to GBP. At least one near a <strong>landmark from your Cheat Sheet.</strong> Rotate through all 5 landmarks so Google sees you active across your entire service area.</p>
                    <p className="text-xs text-slate-600 mt-1">GBP Goal: 5+ photos/month minimum. Active photo uploads = "fresh" business signal.</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>📍 Hyper-Local SEO</strong> → Landmark Hack + Cheat Sheet</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-green-800">📘 Facebook/Instagram — Diagnostic Map Post (10 min)</p>
                    <p className="text-sm text-slate-700">Post a <strong>"Scientific Proof"</strong> photo from a recent job with your diagnostic tool:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-800 text-xs">💧 Moisture Map</span>
                      <span className="bg-yellow-100 px-2 py-0.5 rounded text-yellow-800 text-xs">⚡ Thermal Hot Spot</span>
                      <span className="bg-cyan-100 px-2 py-0.5 rounded text-cyan-800 text-xs">🌡️ Pressure Reading</span>
                      <span className="bg-orange-100 px-2 py-0.5 rounded text-orange-800 text-xs">🏠 Drone Photo</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tools:</strong> <strong>📸 Before/After Story Generator</strong> (Scientific Overlay) + <strong>🛡️ Authority Builder</strong> → Diagnostic Map</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-green-800">📸 Yelp Profile Update (5 min)</p>
                    <p className="text-sm text-slate-700">Upload <strong>2-3 new job photos</strong> to Yelp. Respond to any new Yelp reviews within 24 hours. Keep services list current.</p>
                    <div className="bg-green-50 p-2 rounded mt-1 border-l-4 border-green-400">
                      <p className="text-green-800 text-xs"><strong>📲 Apple Maps Multiplier:</strong> Yelp powers Apple Maps. 60%+ of smartphone users have iPhones. Dominate Yelp = dominate every "Hey Siri, find a [your trade] near me" search.</p>
                    </div>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🚀 Visibility Playbook</strong> → Yelp Algorithm section</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-green-800">🏘️ Nextdoor — Thank Recommendations (5 min)</p>
                    <p className="text-sm text-slate-700">Search your business name on Nextdoor. <strong>Publicly thank every neighbor</strong> who recommended you this week. This triggers the algorithm to show your profile to more neighbors.</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🏘️ Neighborhood Sniper</strong> → Tag-Team online loop strategy</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-green-800">🔗 Cross-Post to Additional Platforms (5 min)</p>
                    <p className="text-sm text-slate-700">Take Monday's Facebook post and repurpose for <strong>Yelp Business Update</strong> and <strong>Google Business post.</strong> Same content, different format.</p>
                    <p className="text-xs text-yellow-700 mt-1">💡 Never copy-paste the exact same text. Rewrite the caption slightly for each platform — algorithms detect duplicates.</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🔥 One Job = One Week</strong> → creates platform-specific versions automatically</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-purple-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-purple-800">🍎 Apple Business Showcase Photo (2 min)</p>
                    <p className="text-sm text-slate-700">Upload one of your <strong>geotagged landmark photos</strong> to Apple Business Connect "Showcases." Siri uses Showcases to decide who to recommend — weekly uploads keep you #1.</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🚀 Unfair Advantage Guide</strong> → Apple Business Connect + <strong>📍 Hyper-Local SEO</strong> → Landmark photos</p>
                  </div>
                </div>
              </div>
            </details>

            {/* ═══════════════ THURSDAY ═══════════════ */}
            <details className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl mb-4 border-2 border-amber-500">
              <summary className="font-bold text-xl text-amber-900 cursor-pointer mb-3 hover:text-amber-700">
                THURSDAY: Authority Building + Email Day (40 min) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-amber-500">
                  <p className="font-bold text-amber-800 text-sm">Thursday builds the long-game assets — blog posts, FAQ pages, and email campaigns that compound over time. Google rewards websites with fresh content. This is how you become the AI's recommended source.</p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-amber-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-amber-800">📝 Authority Blog Post OR FAQ Page (20 min) <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full ml-1">BI-WEEKLY</span></p>
                    <p className="text-sm text-slate-700">Every other Thursday, publish one of these to your website. Alternate:</p>
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-slate-600"><strong>Week 1:</strong> 📝 Blog Post — local topic (e.g. "Top 5 [Trade] Issues in [City] [Season]") using <strong>🛡️ Authority Builder</strong></p>
                      <p className="text-xs text-slate-600"><strong>Week 2:</strong> ❓ FAQ Page — technical questions customers ask (cost, process, timeline) using <strong>❓ FAQ Generator</strong></p>
                      <p className="text-xs text-slate-600"><strong>Week 3:</strong> 📝 Blog Post — case study from a recent job using <strong>🔄 Job Pipeline</strong> SEO blog output</p>
                      <p className="text-xs text-slate-600"><strong>Week 4:</strong> ❓ FAQ Page — new angle (insurance, maintenance, emergency prep) using <strong>❓ FAQ Generator</strong></p>
                    </div>
                    <div className="bg-amber-50 p-2 rounded mt-2 border-l-4 border-amber-400">
                      <p className="text-amber-800 text-xs"><strong>📊 The Math:</strong> 2 posts/month × 12 months = <strong>24 new ranking pages per year.</strong> Each one is a door into your website from Google. Target: 5-10 FAQ pages covering different topics + 1 local blog post/month.</p>
                    </div>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tools:</strong> <strong>🛡️ Authority Builder</strong> + <strong>❓ FAQ/Website Content Generator</strong> + <strong>🔄 Job Pipeline</strong> SEO blog</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-amber-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-amber-800">📧 Email Campaign / Newsletter Send (10 min) <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full ml-1">BI-WEEKLY</span></p>
                    <p className="text-sm text-slate-700">On opposite Thursdays from blog posts, send one email to your customer list. Alternate:</p>
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-slate-600"><strong>Week 1:</strong> 📧 Seasonal tip + "We're booking [Month] now" CTA</p>
                      <p className="text-xs text-slate-600"><strong>Week 2:</strong> (Blog Post week — skip email)</p>
                      <p className="text-xs text-slate-600"><strong>Week 3:</strong> 📧 Customer spotlight + referral incentive</p>
                      <p className="text-xs text-slate-600"><strong>Week 4:</strong> (FAQ Page week — skip email)</p>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Email is the ONLY marketing channel you OWN — not controlled by algorithms.</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>📧 Email Campaign Builder</strong> → Seasonal Check-In or Reactivation template</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-amber-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-amber-800">📄 Neighborhood Landing Page Progress (10 min) <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full ml-1">ONGOING</span></p>
                    <p className="text-sm text-slate-700">Work toward building <strong>1 neighborhood landing page per month</strong> for your Core 10 zip codes. Each page targets "[Service] in [Neighborhood Name]" keywords.</p>
                    <div className="mt-1 space-y-0.5">
                      <p className="text-xs text-slate-600">Include: Local landmarks, school district names, neighborhood-specific problems, photos from that area</p>
                      <p className="text-xs text-slate-600">10 pages × 12 months = your website dominates every wealthy zip code in your service area</p>
                    </div>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tools:</strong> <strong>📍 Hyper-Local SEO</strong> → Neighborhood Landing Pages + <strong>🔍 Website SEO Guide</strong> → service area pages</p>
                  </div>
                </div>
              </div>
            </details>

            {/* ═══════════════ FRIDAY ═══════════════ */}
            <details className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-purple-500">
              <summary className="font-bold text-xl text-purple-900 cursor-pointer mb-3 hover:text-purple-700">
                FRIDAY: Reviews + Reputation + Guerrilla Day (45 min) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-purple-500">
                  <p className="font-bold text-purple-800 text-sm">Friday locks in your reputation for the week and deploys one "street-level" guerrilla move. Reviews + offline presence = the 1-2 punch franchises can't replicate.</p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-purple-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-purple-800">⭐ The Pre-Review Qualifier (5 min)</p>
                    <p className="text-sm text-slate-700">Text your last 3 customers: <em>"On a scale of 1-10, how happy were you?"</em></p>
                    <div className="bg-purple-50 p-2 rounded mt-2 space-y-1">
                      <p className="text-sm text-purple-700"><strong>If 9-10:</strong> Send Google review link immediately.</p>
                      <p className="text-sm text-purple-700"><strong>If 1-8:</strong> Use <strong>💬 Objection Handler</strong> → "Post-Service: Low Rating" → save the relationship.</p>
                    </div>
                    <p className="text-xs text-red-600 mt-1">⚠️ <strong>FTC Safe:</strong> Never block anyone from reviewing.</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>⭐ Review Maximizer</strong> → generates review request email + keyword-rich reply (Asset #4)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-purple-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-purple-800">⭐ The SEO Review Reply Sweep (10 min)</p>
                    <p className="text-sm text-slate-700">Respond to ALL new reviews on <strong>Google, Yelp, and Facebook</strong> from this week. Stuff keywords + neighborhood name in every reply:</p>
                    <p className="text-sm text-purple-700 italic mt-1">"Thanks, Sarah! We love being the go-to for <strong>[your service]</strong> in <strong>[Neighborhood Name]</strong>!"</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-purple-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-purple-800">📘 Facebook — Share Customer Review as Social Proof Post (10 min)</p>
                    <p className="text-sm text-slate-700">Screenshot a 5-star review and turn it into a social proof post. Add caption with neighborhood name and service performed.</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>⭐ Review Maximizer</strong> → Social Proof post template + referral email</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-purple-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-purple-800">🥷 OFFLINE — The Guerrilla Move of the Week (15 min)</p>
                    <p className="text-sm text-slate-700">Rotate through one each Friday:</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-slate-600"><strong>Week 1:</strong> 🚪 <strong>Radius Bomb</strong> — 20 "Neighborly Heads-Up" door hangers around your last job (5 left, 5 right, 10 across)</p>
                      <p className="text-xs text-slate-600"><strong>Week 2:</strong> 📱 <strong>Dynamic QR Update</strong> — Change truck QR code to match this season's offer + park at busiest intersection</p>
                      <p className="text-xs text-slate-600"><strong>Week 3:</strong> 🗑️ <strong>Safe Street Stickers</strong> — Deliver reflective stickers + business card to your top 3 loyal customers</p>
                      <p className="text-xs text-slate-600"><strong>Week 4:</strong> 🤝 <strong>Referral Partner Drop</strong> — Bring "New Homeowner Vouchers" to a realtor, property manager, or insurance agent</p>
                    </div>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🥷 Guerrilla Marketing Tactics</strong> → full scripts, QR setup, WiFi SSID strategy, ordering links</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-purple-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-purple-800">📆 Plan Next Week's Content (5 min)</p>
                    <p className="text-sm text-slate-700">Open your <strong>30-Day Calendar</strong> and preview next week's post topics. Gather any photos you'll need over the weekend.</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>📆 30-Day Content Calendar</strong> → pre-planned topics + hooks for every day</p>
                  </div>
                </div>
              </div>
            </details>

            {/* ═══════════════ WEEKEND ═══════════════ */}
            <details className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl mb-4 border-2 border-orange-500">
              <summary className="font-bold text-xl text-orange-900 cursor-pointer mb-3 hover:text-orange-700">
                WEEKEND: Analytics + Strategy (20 min) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-orange-500">
                  <p className="font-bold text-orange-800 text-sm">Weekend is your "CEO time." Stop working IN the business for 20 minutes and work ON it. Data tells you what to double down on and what to kill.</p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-orange-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-orange-800">📊 The "Big 5" Scan (5 min)</p>
                    <p className="text-sm text-slate-700">Check your <strong>Google Business Performance Dashboard</strong> or CRM (Jobber/Housecall Pro) for the Big 5:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="bg-orange-100 px-2 py-0.5 rounded text-orange-800 text-xs">📞 Calls</span>
                      <span className="bg-orange-100 px-2 py-0.5 rounded text-orange-800 text-xs">📋 Form Submissions</span>
                      <span className="bg-orange-100 px-2 py-0.5 rounded text-orange-800 text-xs">🗺️ Direction Requests</span>
                      <span className="bg-orange-100 px-2 py-0.5 rounded text-orange-800 text-xs">⚡ Action Velocity</span>
                      <span className="bg-orange-100 px-2 py-0.5 rounded text-orange-800 text-xs">📅 Bookings</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>📊 Analytics Dashboard Guide</strong> → Big 5 breakdown</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-orange-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-orange-800">📘 Facebook Top Post + Engagement Check (5 min)</p>
                    <p className="text-sm text-slate-700">Which post got the most <strong>saves/shares/comments?</strong> Note the topic — you'll create 3 versions of it next week. Check: Did your video get 50%+ watch time?</p>
                    <p className="text-xs text-slate-600 mt-1">If Tuesday 6pm posts outperform Monday 9am — adjust your schedule accordingly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-orange-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-orange-800">🚩 The Red Flag Check (5 min)</p>
                    <p className="text-sm text-slate-700">Scan for these warning signs and take action immediately:</p>
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-red-700">🌡️⚡ <strong>High impressions, low clicks</strong> on safety posts? → Hook is boring. Use <strong>🎬 Video Script</strong> → "Scare-to-Repair" hook</p>
                      <p className="text-xs text-red-700">🏠 <strong>High saves, low calls?</strong> → Too much DIY info. Switch to <strong>⚡ Weather Alert</strong> urgency style</p>
                      <p className="text-xs text-red-700">📍 <strong>Calls from wrong zip codes?</strong> → Need more <strong>🏘️ Sniper</strong> posts in target neighborhoods</p>
                      <p className="text-xs text-red-700">📘 <strong>Posting but no engagement?</strong> → Consistency > volume. 3x/week EVERY week beats 15 posts then disappearing</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-orange-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-orange-800">📝 Write Down 1-2 Wins (5 min)</p>
                    <p className="text-sm text-slate-700">What worked this week? A specific post topic? A keyword that generated a call? A guerrilla move that got a lead? <strong>Write it down and triple-down next week.</strong></p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>📊 Analytics Dashboard Guide</strong> → Action Velocity metric + use CallRail or your CRM to identify which posts drove calls</p>
                  </div>
                </div>
              </div>
            </details>

            {/* ═══════════════ AFTER EVERY JOB ═══════════════ */}
            <details className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl mb-4 border-2 border-green-600">
              <summary className="font-bold text-xl text-green-900 cursor-pointer mb-3 hover:text-green-700">
                🔄 AFTER EVERY JOB: The 10-Minute Pipeline (10 min) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800">Do this BEFORE you leave the job site! Every completed job is a content goldmine.</p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-green-800">📸 Take "Scientific Proof" Photos (2 min)</p>
                    <p className="text-sm text-slate-700">Before + After + Diagnostic tool screen (thermal camera, pressure gauge, moisture meter, drone shot).</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🛡️ Authority Builder</strong> → Diagnostic Map tells you which photos to take for your trade</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-green-800">📸 Take a Landmark Photo (1 min)</p>
                    <p className="text-sm text-slate-700">Snap your truck near the closest landmark from your <strong>Cheat Sheet</strong> (school, park, plaza).</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>📍 Hyper-Local SEO</strong> → Landmark Hack + Photo Upload to GBP</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-green-800">💬 Send the "Pre-Review" Text (2 min)</p>
                    <p className="text-sm text-slate-700">"On a scale of 1-10, how happy are you with our work today?"</p>
                    <div className="bg-green-50 p-2 rounded mt-1 space-y-1">
                      <p className="text-xs text-green-700"><strong>9-10:</strong> Send Google review link → <strong>⭐ Review Maximizer</strong></p>
                      <p className="text-xs text-green-700"><strong>1-8:</strong> Service Recovery → <strong>💬 Objection Handler</strong></p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-green-800">🔥 Generate One Week of Content (3 min)</p>
                    <p className="text-sm text-slate-700">Feed job details into the tool. It creates <strong>7 posts</strong> from this single job: GBP, Facebook, Nextdoor, Instagram, Email, Video script, Tip.</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🔥 One Job = One Week of Content</strong></p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-green-800">📋 Run the Full Job Pipeline (2 min)</p>
                    <p className="text-sm text-slate-700">Auto-generates all post-job marketing assets: GBP post, Facebook, Yelp update, email, referral request.</p>
                    <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🔄 Job Pipeline (After Every Job)</strong></p>
                  </div>
                </div>
              </div>
            </details>

            {/* ═══════════════ MONTH-END ═══════════════ */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl mb-4 border-2 border-yellow-500">
              <summary className="font-bold text-xl text-yellow-900 cursor-pointer mb-3 hover:text-yellow-700">
                📊 MONTH-END: THE "SATURDAY 60" (60 min) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800 text-lg">Last Saturday of the Month — The "Strategic Brain" of the System</p>
                  <p className="text-sm text-yellow-700 mt-1">Four audits that ensure you're always one step ahead of every competitor in your market.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-yellow-800">📝 The Monthly Data Audit (15 min)</p>
                      <p className="text-sm text-slate-700">Answer the 5 critical questions: Action Velocity Check, SEO Visibility Check, Vanity vs. Value Filter, AI Citation Audit, Profit Heat Map Decision.</p>
                      <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>📊 Analytics Dashboard Guide</strong> → 5-Minute Monthly Data Audit Worksheet (at the bottom)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-yellow-800">🤖 The AI "Answer Engine" Audit (10 min)</p>
                      <p className="text-sm text-slate-700">Open ChatGPT or Gemini. Ask: <em>"Who is the best [your trade] in [Your City]?"</em></p>
                      <p className="text-sm text-slate-700 mt-1">If you're NOT mentioned → find who IS. Look at the source. Target it next month.</p>
                      <p className="text-xs text-green-700 mt-1"><strong>🔧 Tools:</strong> <strong>🛡️ Authority Builder</strong> → S500/NEC/Manual J Authority + <strong>❓ FAQ Generator</strong> → Technical FAQ page</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-yellow-800">📧 Database Reactivation Text (15 min)</p>
                      <p className="text-sm text-slate-700">Pick 10 past customers. Send a <strong>non-sales "Value" text:</strong></p>
                      <div className="bg-yellow-100 p-2 rounded mt-2 border-l-4 border-yellow-400">
                        <p className="text-yellow-800 text-sm italic">"Hey [Name], [Your Name] from [Business] here. [Weather event] coming Tuesday—make sure to [trade-specific safety tip]! Stay safe!"</p>
                      </div>
                      <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>📧 Email Campaign Builder</strong> → Seasonal Check-In template</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-yellow-800">🕵️ The Competitor Deep-Dive (10 min)</p>
                      <p className="text-sm text-slate-700">Run a full competitor sweep: Ad Library spend, review photo intel, AI Overview citations, keyword rankings.</p>
                      <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🕵️ Competitor Intel</strong> → Shopping List + Visual Spy + AI Overview Spy</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-yellow-800">📍 The NAP + Zip Code Sweep (10 min)</p>
                      <p className="text-sm text-slate-700">Ensure <strong>Name, Address, Phone</strong> are identical everywhere. Then review call logs by zip code:</p>
                      <div className="mt-1 space-y-1">
                        <p className="text-xs text-slate-600">• Calls but no sales from a zip? → Price too high for that area</p>
                        <p className="text-xs text-slate-600">• No calls from a wealthy zip? → Deploy <strong>🏘️ Sniper</strong> + <strong>🥷 Guerrilla Radius Bomb</strong> there next week</p>
                      </div>
                      <p className="text-xs text-green-700 mt-1"><strong>🔧 Tools:</strong> <strong>📍 Hyper-Local SEO</strong> → Neighborhood Pages + <strong>📊 Analytics</strong> → Heat Map Logic</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-purple-800">🔎 The Stealth Monopoly Audit (10 min)</p>
                      <p className="text-sm text-slate-700">Check your "invisible" platforms to make sure you're showing up:</p>
                      <div className="mt-1 space-y-1">
                        <p className="text-xs text-slate-600">🍎 <strong>Siri Check:</strong> Ask your phone, "Find a [Trade] near me." Are you showing up?</p>
                        <p className="text-xs text-slate-600">🤖 <strong>AI Check:</strong> Ask ChatGPT, "Who is the most trusted [Trade] in [City]?" Are you mentioned?</p>
                        <p className="text-xs text-slate-600">🔨 <strong>Point Check:</strong> Log into Home Depot Pro and claim your free leads.</p>
                      </div>
                      <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🚀 Unfair Advantage Guide</strong> → Stealth Monopoly Audit checklist</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-indigo-800">📍 The Bing/AI Sync (5 min)</p>
                      <p className="text-sm text-slate-700">Verify your <strong>Bing Places</strong> dashboard. If your Google reviews or photos have grown this month, click <strong>"Update from Google"</strong> on Bing to ensure ChatGPT has your latest data.</p>
                      <div className="bg-indigo-50 p-2 rounded mt-2 border-l-4 border-indigo-300">
                        <p className="text-indigo-800 text-xs"><strong>🧠 Why This Matters:</strong> Bing Places is the data source ChatGPT pulls from when recommending local businesses. If your Bing profile is stale, ChatGPT recommends your competitor — even if you have 200 more Google reviews.</p>
                      </div>
                      <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🚀 Unfair Advantage Guide</strong> → Platform #2: Answer Engine Optimization (Bing section)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-green-800">💬 WhatsApp Channel Monthly Broadcast (5 min)</p>
                      <p className="text-sm text-slate-700">Send one <strong>"Storm Warning"</strong> or <strong>"Maintenance Tip"</strong> to your WhatsApp Business Channel subscribers. When customers forward it to their neighborhood group, it's a verified referral.</p>
                      <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>⚡ Weather Alert Urgency Posts</strong> → generate the tip, then paste into WhatsApp Channel</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-orange-800">🎯 QUARTERLY: Seasonal Campaign Builder (30 min)</p>
                      <p className="text-sm text-slate-700">Every 3 months, run the <strong>🎯 Seasonal Campaign Builder</strong> to generate a complete multi-channel campaign for next season. One click gives you <strong>6 ready-to-deploy pieces:</strong> 3-email drip, 4 social posts, Google Business offer, flyer copy, 3 text blasts, and a week-by-week execution checklist.</p>
                      <p className="text-sm text-orange-700 mt-1"><strong>💰 This replaces $3,000-5,000 in agency work.</strong> Schedule 30 minutes on the first Saturday 60 of each quarter (March, June, September, December) to build next season's campaign.</p>
                      <p className="text-xs text-green-700 mt-1"><strong>🔧 Tool:</strong> <strong>🎯 Seasonal Campaign Builder</strong> → Select trade, season, campaign focus, and offer details</p>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* ═══════════════ MILESTONE TRACKER ═══════════════ */}
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl mb-6 border-4 border-green-500">
              <h3 className="text-green-900 font-bold text-2xl mb-4">🏆 MILESTONE TRACKER — Your 90-Day Journey</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-l-4 border-green-400">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-green-800 text-lg">MONTH 1: Foundation Built</p>
                    <p className="text-sm text-green-700">All weekly tasks complete for 4 weeks. GBP fully optimized. 10+ new reviews collected. Signal Search alerts running daily.</p>
                    <p className="text-xs text-green-600 mt-1">🔧 <strong>Key Tools Used:</strong> Google Business Post Optimizer, Review Maximizer, Neighborhood Sniper, Hyper-Local SEO</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-l-4 border-blue-400">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-blue-800 text-lg">MONTH 2: Authority Established</p>
                    <p className="text-sm text-blue-700">Ranked in top 3 "Map Pack" for primary service. 1+ Authority Builder blog post published. Competitors studied and countered.</p>
                    <p className="text-xs text-blue-600 mt-1">🔧 <strong>Key Tools Used:</strong> Authority Builder, FAQ Generator, Competitor Intel, Before/After Generator</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-l-4 border-purple-400">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-purple-800 text-lg">MONTH 3: Market Domination</p>
                    <p className="text-sm text-purple-700">AI engines (ChatGPT, Gemini, Google SGE) recommending you by name. Guerrilla presence across target neighborhoods. Referral network active.</p>
                    <p className="text-xs text-purple-600 mt-1">🔧 <strong>Key Tools Used:</strong> All 17 tools working in sync. Analytics Dashboard + ROI Calculator proving ROI.</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-gradient-to-r from-orange-100 to-yellow-100 p-4 rounded-lg border-l-4 border-orange-500">
                <p className="text-orange-900 font-bold text-center text-lg">
                  🎯 95% of competitors are "guessing." You have a SYSTEM with 17 tools doing the work.
                </p>
              </div>
            </div>

            {/* Roadmap Bottom Close Button */}
            <div className="text-center mt-6">
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 text-lg">
                ✕ Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* GUERRILLA MARKETING TACTICS MODAL */}
      {activeModal === 'offlineMarketing' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-5xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">🥷 GUERRILLA MARKETING TACTICS</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-xl mb-6 border-2 border-slate-600">
              <h3 className="text-white font-bold text-2xl mb-3">Win the Street While Your Competitors Fight Over Google</h3>
              <div className="bg-white/10 p-4 rounded-lg mb-4">
                <p className="text-slate-200 leading-relaxed">
                  <strong className="text-white">The Mindset:</strong> This is the era of <strong className="text-yellow-400">"Ad Blindness."</strong> People skip YouTube ads, but they can't skip a branded truck on their street or a QR code on a neighbor's trash can. This playbook gives you the "Underground" moves to build a local monopoly for the cost of a tank of gas. <strong className="text-yellow-400">Own the neighborhood, not just the search results.</strong>
                </p>
              </div>
            </div>

            {/* Tactic 1: The Radius Bomb */}
            <details className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl mb-4 border-2 border-red-500" open>
              <summary className="font-bold text-xl text-red-900 cursor-pointer mb-3 hover:text-red-700">
                1️⃣ The "Radius Bomb" (Door Hangers 2.0) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                  <p className="font-bold text-red-800 text-lg">🎯 The Goal: Turn one service call into a "neighborhood sweep."</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                    <p className="text-yellow-800 font-bold">❌ The Problem:</p>
                    <p className="text-yellow-700 text-sm mt-1">Standard door hangers look like junk mail and get tossed immediately.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">🎯 The Hack:</strong>
                    <p className="mt-1 text-slate-700">Use a <strong>"Neighborly Heads-Up"</strong> approach. When you are working on a house, the neighbors are naturally curious (and sometimes slightly annoyed by the noise/truck).</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">📋 The Action:</strong>
                    <p className="mt-1 text-slate-700">Place hangers on the <strong>5 houses to the left, 5 to the right, and the 10 directly across the street.</strong></p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700">📝 The Script:</strong>
                    <div className="bg-red-50 p-4 rounded mt-2 border-l-4 border-red-500">
                      <p className="text-red-800 italic">"Sorry for the noise! We're helping your neighbor at [Address] fix a [Trade Problem]. If you need anything while we have our equipment in the neighborhood today, we'll give you <strong>$50 off</strong> just for being a great neighbor."</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">🏆 The Result:</strong>
                    <p className="mt-1 text-green-700">You aren't a solicitor; you're a <strong>courteous professional.</strong> You turn one job into three.</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 mt-2">
                    <p className="text-blue-800 text-sm font-bold">🪧 The "Social Proof" Marker:</p>
                    <p className="text-blue-700 text-sm mt-1">When placing the hanger, if you have a lawn sign (Tactic 6) at the job site, point to it: <em>"Check out the progress at [Address] — the sign out front has a live link to the before/afters."</em> This forces the neighbor to look at your work twice.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Tactic 2: QR Code Billboard Truck */}
            <details className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-blue-500">
              <summary className="font-bold text-xl text-blue-900 cursor-pointer mb-3 hover:text-blue-700">
                2️⃣ The "QR Code Billboard" Truck Hack <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800 text-lg">🎯 The Goal: Turn your truck into a high-converting lead machine.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">❌ The Problem:</strong>
                    <p className="mt-1 text-slate-700">People don't write down phone numbers while driving or walking past a truck.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">🎯 The Hack:</strong>
                    <p className="mt-1 text-slate-700">Place a <strong>massive (12-inch) Dynamic QR Code</strong> on the back and sides of your truck.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700">🔄 The Logic: Use a Dynamic QR</strong>
                    <p className="mt-1 text-slate-700">Use a Dynamic QR (via <a href="https://qrcodekit.com" target="_blank" className="text-blue-600 underline font-bold">QRCodeKIT</a> or Supercode) so you can change the link <strong>without re-wrapping the truck.</strong></p>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-blue-100 p-3 rounded text-center">
                        <p className="text-blue-900 font-bold text-sm">❄️ Winter</p>
                        <p className="text-blue-700 text-xs mt-1">QR links to "Emergency Pipe/Heater Repair"</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded text-center">
                        <p className="text-green-900 font-bold text-sm">🌸 Spring</p>
                        <p className="text-green-700 text-xs mt-1">QR links to "Annual Maintenance/Inspection Special"</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> When a storm is forecasted, use the <strong>⚡ Weather Alert Urgency Posts</strong> tool to generate an emergency response post. Then change your Truck QR destination to an "Instant Storm Response" booking page — the post drives traffic, the QR captures it.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Tactic 3: Trash Can Branding */}
            <details className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl mb-4 border-2 border-green-500">
              <summary className="font-bold text-xl text-green-900 cursor-pointer mb-3 hover:text-green-700">
                3️⃣ The "Trash Can Branding" Strategy <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800 text-lg">🎯 The Goal: Become a permanent, trusted fixture in the neighborhood.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                    <p className="text-yellow-800 font-bold">💡 Key Insight:</p>
                    <p className="text-yellow-700 text-sm mt-1">The most visible object in any neighborhood every week is the <strong>trash can at the curb.</strong></p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-green-700">🎯 The Hack:</strong>
                    <p className="mt-1 text-slate-700">Give your <strong>"Top 10" loyal customers</strong> high-quality, reflective stickers for their bins.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700">📝 The Script:</strong>
                    <div className="bg-green-50 p-4 rounded mt-2 border-l-4 border-green-500">
                      <p className="text-green-800 italic">"Since you've been a loyal customer, we'd like to include you in our <strong>'Safe Street' program.</strong> This reflective sticker makes your bin visible to cars at night—and it lets the neighbors know who keeps the systems on this street running."</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                    <strong className="text-green-800">🏆 The Win:</strong>
                    <p className="mt-1 text-green-700">This is a <strong>Landmark Hack in physical form.</strong> It signals you are the "Official" pro of that specific street.</p>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500 mt-2">
                    <p className="text-yellow-800 text-sm font-bold">🔦 The "Safety" Angle:</p>
                    <p className="text-yellow-700 text-sm mt-1">In your pitch to the homeowner, emphasize that the reflective sticker helps <strong>delivery drivers and emergency vehicles</strong> see their bin and house at night. You're framing your marketing as a <strong>safety upgrade</strong> for the homeowner — not an ad.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Tactic 4: Local Hero Referral Bundle */}
            <details className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-purple-500">
              <summary className="font-bold text-xl text-purple-900 cursor-pointer mb-3 hover:text-purple-700">
                4️⃣ The "Local Hero" Referral Bundle <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="font-bold text-purple-800 text-lg">🎯 The Goal: Get into new homeowners' houses via a built-in recommendation.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                    <p className="text-blue-800 font-bold">💡 Key Insight:</p>
                    <p className="text-blue-700 text-sm mt-1">Partner with people who talk to your customers <strong>before</strong> the problem happens.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700">📋 The Action:</strong>
                    <p className="mt-1 text-slate-700">Partner with a local <strong>Realtor, Property Manager, or Dry Cleaner.</strong></p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">🎯 The Strategy:</strong>
                    <p className="mt-1 text-slate-700">Give them <strong>$100 "New Homeowner Vouchers"</strong> to include in their <strong>"Welcome to the Neighborhood"</strong> gift baskets.</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">🏆 The Result:</strong>
                    <p className="mt-1 text-green-700">You get into the house of a <strong>new homeowner</strong> (who usually has a massive "to-do" list) with a pre-built recommendation from someone they already trust.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Tactic 5: Reverse Business Card */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl mb-4 border-2 border-yellow-500">
              <summary className="font-bold text-xl text-yellow-900 cursor-pointer mb-3 hover:text-yellow-700">
                5️⃣ The "Reverse" Business Card (Utility Marketing) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800 text-lg">🎯 The Goal: Put your advertisement in the most valuable spot in the house.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-yellow-700">🎯 The Hack:</strong>
                    <p className="mt-1 text-slate-700">Don't hand out paper; hand out a <strong>Trade Utility Tool</strong> with your info and QR code on it.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">🔧 Trade-Specific Examples:</strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <div className="bg-blue-50 p-2 rounded flex items-center gap-2">
                        <span className="text-lg">🔧</span>
                        <p className="text-sm text-slate-700"><strong>Plumbing/Restoration:</strong> Branded Water-Shutoff Wrench</p>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        <p className="text-sm text-slate-700"><strong>Electricians:</strong> Branded Circuit Breaker Map (Magnetic) or Voltage Tester</p>
                      </div>
                      <div className="bg-red-50 p-2 rounded flex items-center gap-2">
                        <span className="text-lg">🌡️</span>
                        <p className="text-sm text-slate-700"><strong>HVAC:</strong> Branded Magnetic Thermometer for fridge or furnace</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded flex items-center gap-2">
                        <span className="text-lg">🏠</span>
                        <p className="text-sm text-slate-700"><strong>Roofing/General:</strong> High-visibility Magnetic Level or Tape Measure</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">🏆 The Win:</strong>
                    <p className="mt-1 text-green-700">You've placed your info at the <strong>exact location where the next emergency will be discovered.</strong></p>
                  </div>

                  <div className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500 mt-2">
                    <p className="text-indigo-800 text-sm font-bold">📝 The "What to Do" Hack:</p>
                    <p className="text-indigo-700 text-sm mt-1">On the back of the magnetic tool, don't just put your logo. Put: <strong>"STEP 1: Turn this valve. STEP 2: Call [Your Name]."</strong> Visual instructions at the point of failure make you the <strong>only person they will call.</strong></p>
                  </div>
                </div>
              </div>
            </details>

            {/* Tactic 6: Job Site Yard Sign 2.0 */}
            <details className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl mb-4 border-2 border-cyan-500">
              <summary className="font-bold text-xl text-cyan-900 cursor-pointer mb-3 hover:text-cyan-700">
                6️⃣ The "Job Site Yard Sign" 2.0 <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-cyan-500">
                  <p className="font-bold text-cyan-800 text-lg">🎯 The Goal: Force passersby to stop and look, even if they aren't "shopping."</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">❌ The Problem:</strong>
                    <p className="mt-1 text-slate-700">Standard signs with just a name and number are visually ignored (ad blindness).</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-cyan-700">🎯 The Hack: Use a "Scientific Proof" Yard Sign.</strong>
                    <p className="mt-1 text-slate-700">A high-contrast visual of the "Mess" vs. the "Masterpiece" stops foot and car traffic.</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="text-blue-800 text-sm"><strong>💡 YARD SIGN TIP:</strong> Run your job through the <strong>📸 Before/After Story Generator</strong> first — use the carousel captions as inspiration for your yard sign text. The high-contrast "Mess vs. Masterpiece" angle that works online works even better on a physical sign.</p>
                    <div className="bg-white p-2 rounded mt-2 border-l-4 border-cyan-500">
                      <p className="text-cyan-800 text-xs italic font-bold">📝 The Text: "We fixed this [System] yesterday. Is yours next? [QR Code to Gallery]"</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 mt-3">
                    <strong className="text-green-800">🏆 The Result:</strong>
                    <p className="mt-1 text-green-700">It proves you do high-quality work within a <strong>50-foot radius</strong> of where they are standing.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Tactic 7: Community Hero WiFi Strategy */}
            <details className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl mb-4 border-2 border-pink-500">
              <summary className="font-bold text-xl text-pink-900 cursor-pointer mb-3 hover:text-pink-700">
                7️⃣ The "Community Hero" WiFi Strategy <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-pink-500">
                  <p className="font-bold text-pink-800 text-lg">🎯 The Goal: Get your brand name on every smartphone in a 100-yard radius.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-pink-700">🎯 The Hack:</strong>
                    <p className="mt-1 text-slate-700">While working on a long-term job or parked in a busy area, set your truck's mobile hotspot name (SSID) to a marketing message:</p>
                    <div className="space-y-2 mt-3">
                      <div className="bg-pink-50 p-2 rounded border-l-4 border-pink-400">
                        <p className="text-pink-800 font-mono font-bold text-sm">"FREE_ROOF_INSPECTION_CALL_[Number]"</p>
                      </div>
                      <div className="bg-pink-50 p-2 rounded border-l-4 border-pink-400">
                        <p className="text-pink-800 font-mono font-bold text-sm">"EMERGENCY_PLUMBER_ON_SITE"</p>
                      </div>
                      <div className="bg-pink-50 p-2 rounded border-l-4 border-pink-400">
                        <p className="text-pink-800 font-mono font-bold text-sm">"SAFE_ELECTRICAL_TIPS_[YourBiz]"</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">🏆 The Result:</strong>
                    <p className="mt-1 text-green-700">When neighbors look for WiFi, your "Ad" pops up at the very top of their connection list. It costs <strong>$0</strong> and ensures brand dominance on that block.</p>
                  </div>

                  <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500 mt-2">
                    <p className="text-red-800 text-sm font-bold">⚠️ The "Security" Shield:</p>
                    <p className="text-red-700 text-sm mt-1">Ensure your hotspot has a <strong>password.</strong> You aren't actually giving away free internet — you're using the network name as a billboard. If you leave it open, people may connect and slow down your work tablets and tools. Keep it locked, but keep the name loud!</p>
                  </div>
                </div>
              </div>
            </details>

            {/* The Guerrilla's Golden Rule */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-xl mb-4 border-4 border-yellow-500">
              <h3 className="text-yellow-400 font-bold text-2xl mb-4">🥷 The Guerrilla's Golden Rule</h3>

              <div className="bg-white/10 p-4 rounded-lg mb-4">
                <p className="text-white text-xl font-bold text-center">
                  "Never Park in the Driveway."
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-lg space-y-3">
                <p className="text-slate-200">
                  Always park your branded truck <strong className="text-yellow-400">on the street</strong>, in front of the house, where the most eyes can see the wrap.
                </p>
                <p className="text-slate-200">
                  If safe, keep the back doors <strong className="text-yellow-400">OPEN</strong> to show your organized, high-tech equipment. People trust organized, "ready-for-war" professionals.
                </p>
                <p className="text-slate-200">
                  If you're at lunch, park at the <strong className="text-yellow-400">busiest spot in the plaza.</strong>
                </p>
                <p className="text-yellow-400 font-bold text-lg mt-4">
                  Your truck should never be "hidden."
                </p>
              </div>

              <div className="bg-blue-500/20 p-3 rounded-lg mt-4 border-l-4 border-blue-400">
                <p className="text-blue-200 text-sm"><strong>🔧 ACTION:</strong> Take a photo of your open truck and use the <strong>📍 Google Business Post Optimizer</strong> to post it to Google Maps with the caption: <em>"Spotted in [Neighborhood Name] today—ready for anything. Scan the QR on our bumper for a neighborhood discount!"</em></p>
              </div>
            </div>

            {/* Essential Guerrilla Links */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 rounded-xl mb-6 border-2 border-slate-500">
              <h3 className="text-white font-bold text-xl mb-3">🔗 Essential "Guerrilla" Links</h3>
              <div className="space-y-2">
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-sm text-slate-200"><strong className="text-yellow-400">🏷️ StickerGiant:</strong> <a href="https://stickergiant.com" target="_blank" className="text-blue-400 underline font-bold">stickergiant.com</a> (High-quality, reflective trash can and truck decals)</p>
                </div>
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-sm text-slate-200"><strong className="text-yellow-400">📱 QRCodeKIT:</strong> <a href="https://qrcodekit.com" target="_blank" className="text-blue-400 underline">qrcodekit.com</a> (Manage Dynamic QR Codes and change offers remotely)</p>
                </div>
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-sm text-slate-200"><strong className="text-yellow-400">🧲 Moo Magnets:</strong> <a href="https://moo.com" target="_blank" className="text-blue-400 underline">moo.com</a> (For "Reverse" business cards and magnetic breaker maps)</p>
                </div>
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-sm text-slate-200"><strong className="text-yellow-400">🔧 4Imprint:</strong> <a href="https://4imprint.com" target="_blank" className="text-blue-400 underline">4imprint.com</a> (Search "Magnetic Levels" or "Voltage Testers" to add your branding)</p>
                </div>
              </div>
            </div>

            {/* Saturday 60 Bridge */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl mb-4 border-2 border-indigo-500">
              <h3 className="text-indigo-900 font-bold text-xl mb-3">📅 KEEP THE GUERRILLA MOVES ROLLING</h3>
              <p className="text-indigo-800 leading-relaxed">
                Your <strong>📋 30-DAY DOMINATION ROADMAP</strong> schedules one offline guerrilla move every Friday. The <strong>Saturday 60</strong> monthly review is the perfect time to check your QR code links are current, your sticker inventory is stocked, and your truck wrap is clean and visible.
              </p>
            </div>

            {/* Bottom Close Button */}
            <div className="text-center mt-6">
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 text-lg">
                ✕ Close
              </button>
            </div>

          </div>
        </div>
      )}

            {/* WEEK CONTENT MODAL */}
      {activeModal === 'weekContent' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-4xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">🔥 One Job = One Week of Content</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* WHAT IS THIS */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">🔥 What Does This Tool Do?</h3>
              <p className="text-blue-900 leading-relaxed mb-3">
                This tool takes <strong>ONE completed job</strong> and creates <strong>7 different marketing pieces</strong> - one for each day of the week!
                Each piece targets a different platform (Google Business Profile, Facebook, Nextdoor, Yelp, Website) with a different angle on the same job.
              </p>
              <p className="text-blue-900 leading-relaxed">
                <strong>Why use it?</strong> Maximum ROI from every job! Instead of just doing the work and moving on, you get an entire week of
                marketing content that builds your reputation, attracts new customers, and shows off your expertise. Each piece is written in the <strong>native tone of that platform</strong> — Google gets SEO keywords, Nextdoor gets neighbor energy, Facebook gets storytelling, Yelp gets professional credibility.
              </p>
            </div>

            {/* PRO TIPS */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl mb-6 border-2 border-yellow-400">
              <summary className="font-bold text-lg text-yellow-900 cursor-pointer mb-3">💡 PRO TIPS: Getting Fresh Angles (Click to Expand)</summary>
              <div className="mt-3 text-slate-700">
                <p className="mb-3 font-semibold">Running this multiple times for similar jobs? Here's how to get completely different content each time by changing your input wording:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div>
                    <strong className="text-yellow-700">🔄 Example: Same AC Repair Job, 4 Different Angles</strong>
                  </div>

                  <div>
                    <strong>Angle 1 - COST FOCUS:</strong>
                    <p className="text-sm ml-4 text-slate-600">Work Done: "Prevented $3,200 compressor replacement with $480 capacitor repair"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI emphasizes dollar savings and ROI</p>
                  </div>

                  <div>
                    <strong>Angle 2 - URGENCY FOCUS:</strong>
                    <p className="text-sm ml-4 text-slate-600">Work Done: "Restored cooling in 2 hours during 95° heat wave - family with infant"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI emphasizes emergency response and customer safety</p>
                  </div>

                  <div>
                    <strong>Angle 3 - TECHNICAL FOCUS:</strong>
                    <p className="text-sm ml-4 text-slate-600">Work Done: "Diagnosed failing start capacitor causing short-cycling and 40% higher energy bills"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI emphasizes expertise and diagnostic capability</p>
                  </div>

                  <div>
                    <strong>Angle 4 - SEASONAL FOCUS:</strong>
                    <p className="text-sm ml-4 text-slate-600">Work Done: "Pre-summer AC tune-up caught capacitor failure before peak cooling season"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI emphasizes preventive maintenance and timing</p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-semibold text-yellow-900">
                  💡 Same job, 4 completely different content sets! The AI will automatically vary content, but YOU control the primary angle by how you describe the work.
                </p>
              </div>
            </details>

            {/* HOW TO POST */}
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border-2 border-slate-300">
              <h3 className="text-slate-900 font-bold text-xl mb-4">📱 How to Post Your 7 Days of Content</h3>

              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500 mb-4">
                <p className="text-orange-900 text-sm font-bold">⚡ Generate ALL 7 pieces on Monday. Then distribute them throughout the week following your 📋 30-Day Domination Roadmap:</p>
              </div>

              <div className="space-y-3 text-slate-700">
                <div>
                  <strong className="text-blue-600">Monday (Content Creation Day):</strong> Generate all 7 pieces. Post <strong>Day 5 (GBP Post)</strong> as your Landmark Hack post + <strong>Day 1 (Educational Tip)</strong> to Facebook at 6-9pm + Apple Showcase photo
                </div>
                <div>
                  <strong className="text-blue-600">Tuesday (Video + Nextdoor):</strong> Post <strong>Day 6 (Nextdoor Update)</strong> as your educational tip + Film a 30-sec video using Day 1's content as your script
                </div>
                <div>
                  <strong className="text-blue-600">Wednesday (Visual Proof Day):</strong> Post <strong>Day 3 (Facebook Carousel)</strong> with job photos + <strong>Day 7 (Yelp Update)</strong> + Upload geotagged photos to GBP
                </div>
                <div>
                  <strong className="text-blue-600">Thursday (Authority Day):</strong> Publish <strong>Day 2 (Case Study Blog)</strong> to your website — this is your SEO-ranked long-form authority piece
                </div>
                <div>
                  <strong className="text-blue-600">Friday (Reviews + Social Proof):</strong> Post <strong>Day 4 (Neighborhood Hero Story)</strong> to Facebook as a social proof post + Request reviews from this week's customers
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-900 text-sm">
                  <strong>💡 Pro Tip:</strong> Schedule all 7 pieces at once using a free tool like Buffer or Hootsuite.
                  Set them to post throughout the week so you stay visible without daily work!
                </p>
              </div>

              <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-900 text-sm">
                  <strong>🔧 TOOL SYNC:</strong> Run your best job photo through the <strong>📸 Before/After Story Generator</strong> for geotagged captions and SEO alt-text — this turns your carousel photos into Google ranking signals.
                </p>
              </div>
            </div>

            <h3 className="text-slate-900 font-bold text-lg mb-4">✍️ Enter Job Details</h3>

            <div>
              <div className="mb-4">
                <label className="block font-bold mb-2">Business Type *</label>
                <select id="wc_business_type" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">-- Select Your Trade --</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Target Market *</label>
                <select id="wc_target_market" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  {targetMarkets.map(market => (
                    <option key={market} value={market}>{market}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Job Address *</label>
                <input id="wc_address" required className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="123 Main St, Camp Hill" />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Specific Service/Job Type *</label>
                <input id="wc_service" required className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="e.g., Water heater replacement, AC repair, Roof leak fix" />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Work Performed *</label>
                <textarea id="wc_work" required className="w-full p-3 border-2 border-slate-300 rounded-lg min-h-[100px]" placeholder="Brief description of what you did..." />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Neighborhood/Area *</label>
                <input id="wc_neighborhood" required className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="Camp Hill, East Shore, etc." />
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500 mb-4">
                <p className="text-amber-800 text-sm"><strong>⏱️ Heads Up:</strong> This generates ~2,500 words of expert content across 7 platforms. Please allow <strong>45-60 seconds</strong> — do not navigate away or press the button again. The AI is writing content that would take an agency 3-4 hours.</p>
              </div>

              <button
                onClick={generateWeekContent}
                disabled={loading}
                className="btn w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚀 Generate 7 Days of Content
              </button>
            </div>

            {loading && (
              <div className="text-center py-10">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-slate-600">AI is creating your weekly content...</p>
                {statusMessage && (
                  <p className="text-blue-600 font-bold mt-3">{statusMessage}</p>
                )}
              </div>
            )}

            {!loading && statusMessage && (
              <div className="mt-6 bg-blue-50 border-2 border-blue-500 text-blue-900 p-4 rounded-lg">
                {statusMessage}
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-500 text-red-900 p-4 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

                        {output && (
              <>
                <div className="mt-6 bg-white border-2 border-blue-500 rounded-xl p-6 output-box" style={{boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)"}}>
                  {formatOutput(output)}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${copySuccess ? "bg-green-700" : "bg-green-600"} text-white`}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy to Clipboard"}
                  </button>
                  <button
                    onClick={saveToLibrary}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${saveSuccess ? "bg-purple-700" : "bg-purple-600"} text-white`}
                  >
                    {saveSuccess ? "✅ Saved!" : "💾 Save to Library"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeModal === 'jobPipeline' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-3xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">🔄 Job Pipeline</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

                        {/* WHAT IS THIS */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">🔄 What Does This Tool Do?</h3>
              <p className="text-blue-900 leading-relaxed mb-3">
                This is your <strong>"In-The-Truck" post-job routine.</strong> Finish a job, open this tool, fill in 6 fields in 2 minutes, and get <strong>3 ready-to-use marketing assets</strong>:
                (1) SEO case study blog post, (2) Social media post with engagement question, and (3) Review request email personalized with the customer's name.
              </p>
              <p className="text-blue-900 leading-relaxed mb-3">
                <strong>Why use it?</strong> The Roadmap says "market after EVERY job." This tool makes that possible in 2 minutes. The blog post goes to your website (Thursday Authority Day), the social post goes to Facebook/Nextdoor, and the review email gets sent before you start the next job.
              </p>
              <div className="bg-blue-200 p-3 rounded-lg mt-3">
                <p className="text-blue-900 text-sm"><strong>🔥 vs. One Job = One Week:</strong> That tool generates 7 platform-specific posts for your Monday batch planning. <strong>This tool</strong> is the quick post-job routine — 3 assets in 2 minutes with a review email you can send immediately. Use BOTH: Pipeline after every job, One Job = One Week on Monday.</p>
              </div>
            </div>

            {/* PRO TIPS */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl mb-6 border-2 border-yellow-400">
              <summary className="font-bold text-lg text-yellow-900 cursor-pointer mb-3">💡 PRO TIPS: When to Use This + Getting Fresh Angles (Click to Expand)</summary>
              <div className="mt-3 text-slate-700">

                <div className="bg-white p-4 rounded-lg mb-4 border-l-4 border-orange-500">
                  <p className="font-bold text-orange-700 mb-2">🔄 Job Pipeline vs 🔥 One Job = One Week — When to Use Each:</p>
                  <p className="text-sm mb-1"><strong>🔄 Job Pipeline:</strong> Use AFTER every job, in the truck, 2 minutes. Gets you a blog post, social post, and review email. Send the review email immediately.</p>
                  <p className="text-sm"><strong>🔥 One Job = One Week:</strong> Use on MONDAY planning day. Pick your best job from last week and generate 7 platform-specific posts for the whole week.</p>
                  <p className="text-sm mt-2 font-semibold text-orange-800">💡 Best workflow: Pipeline after every job (quick assets + review email). Then on Monday, pick the best job and run One Job = One Week for your batch content.</p>
                </div>

                <p className="mb-3 font-semibold">Same job, different storytelling angles for maximum variety:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div>
                    <strong className="text-yellow-700">🔄 Example: Roof Leak Repair</strong>
                  </div>

                  <div>
                    <strong>Angle 1 - DAMAGE AVOIDED:</strong>
                    <p className="text-sm ml-4 text-slate-600">Work Done: "Stopped active leak before it damaged $12K attic insulation and drywall"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ Emphasizes cost savings and property protection</p>
                  </div>

                  <div>
                    <strong>Angle 2 - DIAGNOSTIC EXPERTISE:</strong>
                    <p className="text-sm ml-4 text-slate-600">Work Done: "Located hidden valley flashing failure that two other contractors missed"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ Emphasizes superior diagnostic capability vs competitors</p>
                  </div>

                  <div>
                    <strong>Angle 3 - SPEED & RELIABILITY:</strong>
                    <p className="text-sm ml-4 text-slate-600">Work Done: "Emergency repair completed in 4 hours during rainstorm - prevented further water intrusion"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ Emphasizes responsiveness and reliability under pressure</p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-semibold text-yellow-900">
                  💡 The AI varies content automatically, but you can steer the focus by emphasizing different aspects of the same job!
                </p>
              </div>
            </details>

            {/* HOW TO USE */}
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border-2 border-slate-300">
              <h3 className="text-slate-900 font-bold text-xl mb-4">📱 How to Use These 3 Assets</h3>

              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500 mb-4">
                <p className="text-orange-900 text-sm font-bold">⚡ Run this AFTER every job. Send the review email immediately. Save the blog and social post for your weekly Roadmap schedule:</p>
              </div>

              <div className="space-y-3 text-slate-700">
                <div>
                  <strong className="text-blue-600">Asset #1 — SEO Blog Post:</strong> Save for <strong>Thursday (Authority Day)</strong>. Publish on your website blog. The Roadmap's Week 3 Thursday specifically calls for a "case study from a recent job using 🔄 Job Pipeline."
                </div>
                <div>
                  <strong className="text-blue-600">Asset #2 — Social Media Post:</strong> Post to <strong>Facebook on Monday</strong> (Content Creation Day) or <strong>Nextdoor on Tuesday</strong>. Cross-post to GBP on Wednesday.
                </div>
                <div>
                  <strong className="text-blue-600">Asset #3 — Review Request Email:</strong> <strong>Send immediately</strong> after the job — within 2 hours while the customer is still grateful. Copy the email, paste into Gmail/Outlook, replace [Google Review Link] and [Company Name], and hit send.
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-900 text-sm">
                  <strong>💡 Pro Tip:</strong> Do this for EVERY job. It takes 2 minutes to fill the form. The review email alone is worth it — businesses that request reviews within 2 hours get 3x more responses than those who wait a day.
                </p>
              </div>

              <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-900 text-sm">
                  <strong>🔧 TOOL SYNC:</strong> Run your job photo through the <strong>📸 Before/After Story Generator</strong> for geotagged captions. On Monday, pick your best job from the week and run it through <strong>🔥 One Job = One Week</strong> for 7 platform-specific posts.
                </p>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block font-bold mb-2">Business Type *</label>
                <select id="jp_business_type" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">-- Select Your Trade --</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Target Market *</label>
                <select id="jp_target_market" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  {targetMarkets.map(market => (
                    <option key={market} value={market}>{market}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Job Address/Location *</label>
                <input id="jp_address" required className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="123 Main St, Camp Hill" />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Service Type *</label>
                <input id="jp_service" required className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="e.g., AC repair, Pipe replacement, Roof leak fix" />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Work Performed *</label>
                <textarea id="jp_work" required className="w-full p-3 border-2 border-slate-300 rounded-lg min-h-[100px]" placeholder="Brief description of work completed..." />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Customer Name *</label>
                <input id="jp_customer" required className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="First name or full name" />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Customer Email <span className="text-slate-400 font-normal text-sm">(Optional — appears in review email output)</span></label>
                <input id="jp_email" type="email" className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="customer@email.com" />
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500 mb-4">
                <p className="text-amber-800 text-sm"><strong>⏱️ Heads Up:</strong> This generates 3 expert marketing assets (~1,000 words). Please allow <strong>20-30 seconds</strong> — do not navigate away or press the button again.</p>
              </div>

              <button
                onClick={generateJobPipeline}
                disabled={loading}
                className="btn w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔄 Generate 3 Marketing Assets
              </button>
            </div>

            {loading && (
              <div className="text-center py-10">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-slate-600">AI is creating your marketing assets...</p>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-500 text-red-900 p-4 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

                        {output && (
              <>
                <div className="mt-6 bg-white border-2 border-blue-500 rounded-xl p-6 output-box" style={{boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)"}}>
                  {formatOutput(output)}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${copySuccess ? "bg-green-700" : "bg-green-600"} text-white`}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy to Clipboard"}
                  </button>
                  <button
                    onClick={saveToLibrary}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${saveSuccess ? "bg-purple-700" : "bg-purple-600"} text-white`}
                  >
                    {saveSuccess ? "✅ Saved!" : "💾 Save to Library"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeModal === 'calendar' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-3xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">📆 30-Day Content Calendar</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* WHAT IS THIS */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">📆 What Does This Tool Do?</h3>
              <p className="text-blue-900 leading-relaxed mb-3">
                Generates a <strong>complete month of content hooks, talking points, and CTAs</strong> that plug directly into your 📋 30-Day Domination Roadmap.
                Instead of staring at a blank screen wondering "what should I post today?" — you open this calendar, grab the hook for that day, and write your post in 5 minutes.
              </p>
              <p className="text-blue-900 leading-relaxed mb-3">
                <strong>Why use it?</strong> The Roadmap tells you WHERE to post and WHEN. This calendar tells you WHAT to say.
                Generate on the 1st of each month, then you have 30 days of content topics pre-planned.
              </p>
              <div className="bg-blue-200 p-3 rounded-lg mt-3">
                <p className="text-blue-900 text-sm"><strong>📋 Works WITH Your Roadmap:</strong> Each day's content is matched to the Roadmap's platform schedule — Monday hooks go into your GBP + Facebook posts, Tuesday hooks go into your Nextdoor tip and video script, Wednesday hooks go into your Yelp + visual proof posts, etc.</p>
              </div>
            </div>

            {/* PRO TIPS */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl mb-6 border-2 border-yellow-400">
              <summary className="font-bold text-lg text-yellow-900 cursor-pointer mb-3">💡 PRO TIPS: Getting Fresh Calendars (Click to Expand)</summary>
              <div className="mt-3 text-slate-700">

                <div className="bg-white p-4 rounded-lg mb-4 border-l-4 border-orange-500">
                  <p className="font-bold text-orange-700 mb-2">📋 How This Works With Your Roadmap:</p>
                  <p className="text-sm mb-1">Your 📋 30-Day Roadmap tells you <strong>WHERE</strong> to post and <strong>WHEN</strong>. This calendar tells you <strong>WHAT</strong> to say.</p>
                  <p className="text-sm">Generate on the 1st of each month. Each day's hooks are already matched to the Roadmap's platform schedule — just grab the hook, open the right tool, and expand it into a full post.</p>
                </div>

                <p className="mb-3 font-semibold">Need variety for different months? Change your content focus input:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div>
                    <strong className="text-yellow-700">🔄 Same Business, Different Monthly Themes</strong>
                  </div>

                  <div>
                    <strong>January Calendar:</strong>
                    <p className="text-sm ml-4 text-slate-600">Focus: "Winter preparedness and maintenance"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates content about freeze protection, winter damage prevention</p>
                  </div>

                  <div>
                    <strong>February Calendar:</strong>
                    <p className="text-sm ml-4 text-slate-600">Focus: "Customer testimonials and case studies"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates content showcasing past client success stories</p>
                  </div>

                  <div>
                    <strong>March Calendar:</strong>
                    <p className="text-sm ml-4 text-slate-600">Focus: "Spring maintenance and inspections"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates content about pre-season prep and checkups</p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-semibold text-yellow-900">
                  💡 Change the "Content Focus" field each month to get completely different posting themes!
                </p>
              </div>
            </details>

            {/* HOW TO USE */}
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border-2 border-slate-300">
              <h3 className="text-slate-900 font-bold text-xl mb-4">📅 How to Use Your Calendar</h3>

              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500 mb-4">
                <p className="text-orange-900 text-sm font-bold">⚡ Generate on the 1st of each month. Each day's hooks plug directly into your 📋 30-Day Roadmap schedule:</p>
              </div>

              <div className="space-y-3 text-slate-700">
                <div>
                  <strong className="text-blue-600">Step 1:</strong> Copy the entire calendar to a Google Doc or spreadsheet
                </div>
                <div>
                  <strong className="text-blue-600">Step 2:</strong> Each week, grab that week's hooks and plug them into your Roadmap daily workflow — Monday's hooks become your GBP + Facebook posts, Tuesday's become your Nextdoor tip and video script, etc.
                </div>
                <div>
                  <strong className="text-blue-600">Step 3:</strong> Expand hooks into full posts using other tools: <strong>📍 Google Business Post Optimizer</strong> for Monday's GBP post, <strong>🔥 One Job = One Week</strong> if you have a completed job, <strong>🎬 Video Script</strong> for Tuesday's video, <strong>💡 Daily Tip Generator</strong> for educational content
                </div>
                <div>
                  <strong className="text-blue-600">Step 4:</strong> Schedule the week's posts in advance using Buffer, Hootsuite, or native platform schedulers
                </div>
              </div>

              <div className="mt-4 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <p className="text-red-900 text-sm">
                  <strong>⚠️ Important:</strong> Case study posts may include fabricated customer names and street names for realism. <strong>Always change these to real job details</strong> or generic references before posting. Never post a fabricated name on a real street in your area.
                </p>
              </div>

              <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-900 text-sm">
                  <strong>🔧 TOOL SYNC:</strong> Use the calendar hooks as starting points, then generate full posts with <strong>📍 Google Business Post Optimizer</strong>, <strong>💡 Daily Tip Generator</strong>, <strong>🎬 Video Script Command Center</strong>, or <strong>🔥 One Job = One Week</strong>. The calendar gives you the TOPIC — the tools write the POST.
                </p>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block font-bold mb-2">Business Type *</label>
                <select id="cal_business_type" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">-- Select Your Trade --</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Target Market *</label>
                <select id="cal_target_market" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  {targetMarkets.map(market => (
                    <option key={market} value={market}>{market}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Month *</label>
                <select id="cal_month" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option>January</option>
                  <option>February</option>
                  <option>March</option>
                  <option>April</option>
                  <option>May</option>
                  <option>June</option>
                  <option>July</option>
                  <option>August</option>
                  <option>September</option>
                  <option>October</option>
                  <option>November</option>
                  <option>December</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Your City *</label>
                <input id="cal_city" required className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="Harrisburg" />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Content Focus (optional)</label>
                <input id="cal_focus" className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="Educational tips, case studies, testimonials, etc." />
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500 mb-4">
                <p className="text-amber-800 text-sm"><strong>⏱️ Heads Up:</strong> This generates 22 days of content hooks, talking points, and CTAs (~3,000 words). Please allow <strong>45-60 seconds</strong> — do not navigate away or press the button again.</p>
              </div>

              <button
                onClick={generateCalendar}
                disabled={loading}
                className="btn w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📆 Generate 30-Day Calendar
              </button>
            </div>

            {loading && (
              <div className="text-center py-10">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-slate-600">AI is creating your content calendar...</p>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-500 text-red-900 p-4 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

                        {output && (
              <>
                <div className="mt-6 bg-white border-2 border-blue-500 rounded-xl p-6 output-box" style={{boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)"}}>
                  {formatOutput(output)}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${copySuccess ? "bg-green-700" : "bg-green-600"} text-white`}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy to Clipboard"}
                  </button>
                  <button
                    onClick={saveToLibrary}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${saveSuccess ? "bg-purple-700" : "bg-purple-600"} text-white`}
                  >
                    {saveSuccess ? "✅ Saved!" : "💾 Save to Library"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeModal === 'weatherAlert' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-3xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">⚡ Weather Alert Urgency Posts</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

                        {/* WHAT IS THIS */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">⚡ What Does This Tool Do?</h3>
              <p className="text-blue-900 leading-relaxed mb-3">
                When severe weather is forecasted, search volume for your trade <strong>spikes 300-800% in 4 hours.</strong> This tool generates
                an urgency post you can blast across all platforms BEFORE the storm arrives — so you're the first name homeowners see when they panic-search.
              </p>
              <p className="text-blue-900 leading-relaxed">
                <strong>Why use it?</strong> First to post = first to book. The AI writes authority-driven content with dollar amounts, specific risks,
                and actionable prevention steps — not generic "stay safe" fluff. One post during a weather event can generate more calls than a month of regular content.
              </p>
            </div>

            {/* HOW TO USE */}
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border-2 border-slate-300">
              <h3 className="text-slate-900 font-bold text-xl mb-4">📱 How to Post Weather Alerts</h3>

              <div className="space-y-3 text-slate-700">
                <div>
                  <strong className="text-red-600">⏰ Timing:</strong> Post <strong>24-48 hours BEFORE</strong> the weather event hits. This is when search volume spikes and homeowners start panic-searching.
                </div>
                <div>
                  <strong className="text-blue-600">📱 Platforms:</strong> Post on ALL platforms immediately — Facebook, Nextdoor, GBP, and Yelp. Tweak the tone slightly for each: Nextdoor = helpful neighbor, Facebook = authority expert, GBP = SEO keywords + location.
                </div>
                <div>
                  <strong className="text-blue-600">📸 Follow-Up:</strong> After the storm, post a "we're here to help" follow-up with damage photos (with permission). Use <strong>📸 Before/After Story Generator</strong> for emergency job documentation.
                </div>
              </div>

              <div className="mt-4 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <p className="text-red-900 text-sm">
                  <strong>🏘️ Nextdoor Gold:</strong> Nextdoor's algorithm prioritizes <strong>"Safety and Urgency"</strong> content. Posting a weather alert during a local event can get you <strong>10x more impressions</strong> than a standard service post. This is the single highest-reach post type on Nextdoor.
                </p>
              </div>

              <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-900 text-sm">
                  <strong>💡 Pro Tip:</strong> Set up weather alerts on your phone (Weather Channel app or local news). When severe weather is forecasted, generate and post within 30 minutes — being first matters more than being perfect.
                </p>
              </div>

              <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-900 text-sm">
                  <strong>🔧 TOOL SYNC:</strong> After the storm, use <strong>🔄 Job Pipeline</strong> for emergency jobs and <strong>🔥 One Job = One Week</strong> to turn storm damage repairs into a full week of content. Storm jobs = the best case study material you'll ever get.
                </p>
              </div>
            </div>

            {/* PRO TIPS */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl mb-6 border-2 border-yellow-400">
              <summary className="font-bold text-lg text-yellow-900 cursor-pointer mb-3">💡 PRO TIPS: Getting Fresh Angles (Click to Expand)</summary>
              <div className="mt-3 text-slate-700">
                <p className="mb-3 font-semibold">Same weather event, different threat angles:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div>
                    <strong className="text-yellow-700">🔄 Example: High Winds Forecast</strong>
                  </div>

                  <div>
                    <strong>Post 1 - ROOF DAMAGE FOCUS:</strong>
                    <p className="text-sm ml-4 text-slate-600">Threat: "Loose shingles and flashing can lead to $8K+ roof damage"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ Targets homeowners worried about roof integrity</p>
                  </div>

                  <div>
                    <strong>Post 2 - POWER OUTAGE FOCUS:</strong>
                    <p className="text-sm ml-4 text-slate-600">Threat: "Generator failures during outages leave HVAC systems offline"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ Targets customers needing backup power systems</p>
                  </div>

                  <div>
                    <strong>Post 3 - DEBRIS DAMAGE FOCUS:</strong>
                    <p className="text-sm ml-4 text-slate-600">Threat: "Flying debris can damage AC condensers and outdoor equipment"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ Targets customers with expensive outdoor units</p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-semibold text-yellow-900">
                  💡 Vary the "Specific Threat" field to create multiple posts for the same weather event!
                </p>
              </div>
            </details>

            <div>
              <div className="mb-4">
                <label className="block font-bold mb-2">Business Type *</label>
                <select id="wa_business_type" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">-- Select Your Trade --</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Target Market *</label>
                <select id="wa_target_market" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  {targetMarkets.map(market => (
                    <option key={market} value={market}>{market}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Weather Type *</label>
                <select id="wa_weather" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option>Heavy Rain/Flooding</option>
                  <option>Winter Storm/Freeze</option>
                  <option>Ice Storm</option>
                  <option>Hail</option>
                  <option>Hurricane/Tropical Storm</option>
                  <option>Tornado Warning</option>
                  <option>Severe Thunderstorms</option>
                  <option>High Winds</option>
                  <option>Heat Wave</option>
                  <option>Drought</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Specific Threat *</label>
                <textarea id="wa_threat" required className="w-full p-3 border-2 border-slate-300 rounded-lg min-h-[80px]" placeholder="Basement flooding, frozen pipes, roof damage, etc." />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Your City/Area *</label>
                <input id="wa_city" required className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="Harrisburg, East Shore, etc." />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">When (optional)</label>
                <input id="wa_when" className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="Tonight, This weekend, Tomorrow" />
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500 mb-4">
                <p className="text-amber-800 text-sm"><strong>⏱️ Heads Up:</strong> Please allow <strong>15-20 seconds</strong> for your weather alert to generate. Do not navigate away or press the button again.</p>
              </div>

              <button
                onClick={generateWeatherAlert}
                disabled={loading}
                className="btn w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⚡ Generate Weather Alert
              </button>
            </div>

            {loading && (
              <div className="text-center py-10">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-slate-600">AI is creating your weather alert...</p>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-500 text-red-900 p-4 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

                        {output && (
              <>
                <div className="mt-6 bg-white border-2 border-blue-500 rounded-xl p-6 output-box" style={{boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)"}}>
                  {formatOutput(output)}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${copySuccess ? "bg-green-700" : "bg-green-600"} text-white`}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy to Clipboard"}
                  </button>
                  <button
                    onClick={saveToLibrary}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${saveSuccess ? "bg-purple-700" : "bg-purple-600"} text-white`}
                  >
                    {saveSuccess ? "✅ Saved!" : "💾 Save to Library"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeModal === 'beforeAfter' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-3xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">📸 Before/After Story Generator</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* WHAT IS THIS */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">📸 What Does This Tool Do?</h3>
              <p className="text-blue-900 leading-relaxed mb-3">
                Upload your job photos and this tool <strong>analyzes what it sees</strong>, then generates <strong>3 marketing assets</strong>:
                (1) A compelling Facebook/Blog story with cost savings and transformation details,
                (2) Multi-image carousel captions (5 slides) ready to post, and
                (3) <strong>SEO Image Alt-Text</strong> that tells Google, Facebook, and Apple's AI exactly what your photos show — so they get matched to "near me" searches automatically.
              </p>
              <p className="text-blue-900 leading-relaxed">
                <strong>Why use it?</strong> Before/after content gets the highest engagement of any post type. A job photo with no story gets 12 likes.
                A before/after with a diagnostic narrative gets 200+ views, 30 saves, and DMs asking "can you do this for me?"
              </p>
              <div className="bg-blue-200 p-3 rounded-lg mt-3">
                <p className="text-blue-900 text-sm"><strong>📷 AI Photo Analysis:</strong> Upload 1-5 job photos and the AI will describe exactly what it sees — real materials, real colors, real conditions. No photos? No problem — just describe the job and the AI fabricates realistic details.</p>
              </div>
            </div>

            {/* HOW TO USE */}
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border-2 border-slate-300">
              <h3 className="text-slate-900 font-bold text-xl mb-4">📱 How to Use Your Before/After Content</h3>

              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500 mb-4">
                <p className="text-orange-900 text-sm font-bold">⚡ Your Roadmap schedule for before/after content: Monday = Facebook story post, Wednesday = GBP photos + Yelp update</p>
              </div>

              <div className="space-y-3 text-slate-700">
                <div>
                  <strong className="text-blue-600">📝 Story (Piece #1):</strong> Post on <strong>Facebook on Monday</strong> (Content Creation Day) or publish on your website blog on <strong>Thursday</strong> (Authority Day). This is your long-form transformation narrative.
                </div>
                <div>
                  <strong className="text-blue-600">📸 Carousel (Piece #2) — Facebook:</strong> Click "Photo/Video" → upload 5 images → paste captions below each. <strong>Best performing format for home services on Facebook.</strong>
                </div>
                <div>
                  <strong className="text-blue-600">📸 Carousel — Google Business Profile:</strong> Upload multiple images in a single GBP post on <strong>Wednesday</strong> (Visual Proof Day). Use the carousel captions.
                </div>
                <div>
                  <strong className="text-blue-600">📸 No Carousel? No Problem:</strong> Post as single long-form story on Nextdoor (Tuesday) or Yelp (Wednesday), or break into 5 separate daily posts.
                </div>
                <div>
                  <strong className="text-blue-600">🏷️ Alt-Text (Piece #3) — SEO Boost:</strong> Copy the generated alt-text and paste it into each photo when uploading. Facebook: click photo → Edit → Alternative Text. GBP: Add description field. Website: image "alt" attribute. <strong>This tells AI exactly what your photo shows so it gets matched to searches.</strong>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-900 text-sm">
                  <strong>💡 Pro Tip:</strong> Take before photos on EVERY job — even simple work looks impressive when you show the transformation. Carousels get 2-3x more engagement than single photos on Facebook.
                </p>
              </div>

              <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-900 text-sm">
                  <strong>🔧 TOOL SYNC:</strong> Use the same job details in <strong>🔥 One Job = One Week</strong> for 7 platform-specific posts, and <strong>🎬 Video Script Command Center</strong> for a before/after video script. One great job = 3 tools = 2 weeks of content.
                </p>
              </div>
            </div>

            {/* PRO TIPS */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl mb-6 border-2 border-yellow-400">
              <summary className="font-bold text-lg text-yellow-900 cursor-pointer mb-3">💡 PRO TIPS: Getting Different Angles (Click to Expand)</summary>
              <div className="mt-3 text-slate-700">
                <p className="mb-3 font-semibold">Same job, different storytelling angles for maximum variety:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div>
                    <strong className="text-yellow-700">🔄 Example: Kitchen Remodel</strong>
                  </div>

                  <div>
                    <strong>Run 1 — DESIGN TRANSFORMATION:</strong>
                    <p className="text-sm ml-4 text-slate-600">Description: "Outdated 1980s kitchen → modern open-concept with quartz counters and custom cabinets"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates visual transformation story focused on aesthetics and livability</p>
                  </div>

                  <div>
                    <strong>Run 2 — PROPERTY VALUE:</strong>
                    <p className="text-sm ml-4 text-slate-600">Description: "Kitchen remodel that added $45K to home value in Camp Hill market"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates investment-focused story with ROI, appraisal data, market comps</p>
                  </div>

                  <div>
                    <strong>Run 3 — HIDDEN PROBLEM DISCOVERY:</strong>
                    <p className="text-sm ml-4 text-slate-600">Description: "During demo, discovered water damage and mold behind walls — caught before it spread"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates diagnostic story focused on prevention and thoroughness</p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-semibold text-yellow-900">
                  💡 Upload photos each time and vary the "Transformation Description" to get completely different stories from the same job!
                </p>
              </div>
            </details>

            <div>
              <div className="mb-4">
                <label className="block font-bold mb-2">Business Type *</label>
                <select id="ba_business_type" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">-- Select Your Trade --</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Target Market *</label>
                <select id="ba_target_market" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  {targetMarkets.map(market => (
                    <option key={market} value={market}>{market}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Job Type *</label>
                <input id="ba_type" required className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="e.g., Kitchen remodel, AC replacement, Roof repair" />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Transformation Description <span className="text-slate-400 font-normal text-sm">(Optional if photos uploaded)</span></label>
                <textarea id="ba_description" className="w-full p-3 border-2 border-slate-300 rounded-lg min-h-[100px]" placeholder="Describe what changed: flooded basement to dry, dated kitchen to modern, etc. More detail = better output. Optional if you upload photos." />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Location/Neighborhood *</label>
                <input id="ba_location" required className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="Camp Hill, East Shore, Mechanicsburg, etc." />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Upload Job Photos <span className="text-slate-400 font-normal text-sm">(Optional — up to 5 photos)</span></label>
                <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center bg-blue-50">
                  <p className="text-blue-800 mb-1 font-bold">📷 AI Photo Analysis — The AI will look at your photos and describe what it sees</p>
                  <p className="text-slate-600 mb-3 text-sm">Upload before photos, after photos, or both. The AI writes the story based on what's actually in your images.</p>
                  <input
                    type="file"
                    id="ba_images"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const fileList = files.map(f => f.name).join(', ');
                      const display = document.getElementById('ba_image_display');
                      if (display) {
                        display.textContent = files.length > 0 ? `✅ ${files.length} photo${files.length > 1 ? 's' : ''} ready: ${fileList}` : 'No files selected';
                        display.className = files.length > 0 ? 'text-green-700 font-bold mt-2 text-sm' : 'text-slate-400 mt-2 text-sm';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('ba_images')?.click()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
                  >
                    Choose Photos
                  </button>
                  <p id="ba_image_display" className="text-slate-400 mt-2 text-sm">No files selected</p>
                  <p className="text-xs text-blue-600 mt-2 font-semibold">📸 Photos are sent directly to the AI for analysis — no description needed if you upload clear photos!</p>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500 mb-4">
                <p className="text-amber-800 text-sm"><strong>⏱️ Heads Up:</strong> This generates 3 marketing assets (~1,500 words). Please allow <strong>30-45 seconds</strong> (longer if photos are uploaded for analysis). Do not navigate away or press the button again.</p>
              </div>

              <button
                onClick={generateBeforeAfter}
                disabled={loading}
                className="btn w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📸 Generate Story + Carousel
              </button>
            </div>

            {loading && (
              <div className="text-center py-10">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-slate-600">AI is creating your transformation story...</p>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-500 text-red-900 p-4 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

                        {output && (
              <>
                <div className="mt-6 bg-white border-2 border-blue-500 rounded-xl p-6 output-box" style={{boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)"}}>
                  {formatOutput(output)}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${copySuccess ? "bg-green-700" : "bg-green-600"} text-white`}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy to Clipboard"}
                  </button>
                  <button
                    onClick={saveToLibrary}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${saveSuccess ? "bg-purple-700" : "bg-purple-600"} text-white`}
                  >
                    {saveSuccess ? "✅ Saved!" : "💾 Save to Library"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeModal === 'videoScript' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-4xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">🎬 Video Script Command Center</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* WHAT IS THIS */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">🎬 What Does This Tool Do?</h3>
              <p className="text-blue-900 leading-relaxed mb-3">
                This tool takes <strong>ONE completed job</strong> and generates <strong>up to 8 ready-to-film video scripts</strong> instantly:
                Before/After showcase, Neighborhood announcement, Case study breakdown, Testimonial request guide, Educational tips, Behind-the-scenes, Quick win/fun fact, and a 15-second Pattern Interrupt for Reels/TikTok.
              </p>
              <p className="text-blue-900 leading-relaxed">
                <strong>Why use it?</strong> Every job becomes multiple professional videos. Film in 30 minutes, edit in CapCut (we show you how!),
                post everywhere. Video gets 10x the engagement of photos!
              </p>
            </div>

            {/* CAPCUT GUIDE */}
            <details className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl mb-6 border-2 border-purple-400">
              <summary className="font-bold text-lg text-purple-900 cursor-pointer mb-3">🎬 How to Edit in CapCut (Click to Expand)</summary>
              <div className="mt-3 text-slate-700">
                <div className="mb-4 p-3 bg-purple-100 rounded-lg border-l-4 border-purple-500">
                  <p className="text-purple-900 font-semibold mb-2">
                    📱 Download CapCut (FREE): <a href="https://www.capcut.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">www.capcut.com</a>
                  </p>
                  <p className="text-purple-800 text-sm">Available for iPhone, Android, and Desktop - completely free!</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div>
                    <strong className="text-purple-700">📹 STEP 1: Import Your Clips</strong>
                    <ul className="ml-4 mt-2 space-y-1 text-sm">
                      <li>• Open CapCut → Click "New Project"</li>
                      <li>• Select all video clips you filmed (following your script)</li>
                      <li>• Drag clips to timeline in order</li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-purple-700">✂️ STEP 2: Trim and Arrange</strong>
                    <ul className="ml-4 mt-2 space-y-1 text-sm">
                      <li>• Tap each clip → use scissors icon to trim excess</li>
                      <li>• Drag clips to reorder if needed</li>
                      <li>• Aim for 30-60 seconds total (attention span sweet spot)</li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-purple-700">📝 STEP 3: Add Text Overlays</strong>
                    <ul className="ml-4 mt-2 space-y-1 text-sm">
                      <li>• Click "Text" → "Add Text"</li>
                      <li>• Type your hook from the script (e.g., "BEFORE: Flooded basement")</li>
                      <li>• Choose bold, easy-to-read font</li>
                      <li>• Make text large (people watch without sound!)</li>
                      <li>• Add text to EVERY scene change</li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-purple-700">🎵 STEP 4: Add Music (Optional)</strong>
                    <ul className="ml-4 mt-2 space-y-1 text-sm">
                      <li>• Click "Audio" → "Sounds"</li>
                      <li>• Search "upbeat" or "inspiring"</li>
                      <li>• Keep volume LOW (music = background only)</li>
                      <li>• Or skip music entirely - many top videos have no music</li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-purple-700">🎤 STEP 5: Add Voiceover OR Captions</strong>
                    <ul className="ml-4 mt-2 space-y-1 text-sm">
                      <li><strong>Option A - Voiceover:</strong></li>
                      <li className="ml-4">→ Click "Audio" → "Record"</li>
                      <li className="ml-4">→ Read your script while video plays</li>
                      <li><strong>Option B - Auto Captions:</strong></li>
                      <li className="ml-4">→ Click "Text" → "Auto Captions"</li>
                      <li className="ml-4">→ CapCut generates captions from your voiceover</li>
                      <li className="ml-4">→ Style them with bold yellow/white text</li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-purple-700">💾 STEP 6: Export</strong>
                    <ul className="ml-4 mt-2 space-y-1 text-sm">
                      <li>• Click "Export" in top right</li>
                      <li>• Choose 1080p resolution</li>
                      <li>• Wait for processing (30 seconds - 2 minutes)</li>
                      <li>• Save to camera roll</li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-purple-700">📱 STEP 7: Post Everywhere</strong>
                    <ul className="ml-4 mt-2 space-y-1 text-sm">
                      <li>✅ Facebook (feed video)</li>
                      <li>✅ Google Business Profile</li>
                      <li>✅ Nextdoor</li>
                      <li>✅ Website (embed)</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-purple-100 rounded-lg border-l-4 border-purple-500">
                  <p className="text-purple-900 text-sm font-semibold">
                    ⏱️ Total editing time: 5-15 minutes once you get the hang of it!
                  </p>
                  <p className="text-purple-800 text-sm mt-1">
                    First video takes 20-30 min. By video #3, you'll be flying through edits in under 10 minutes.
                  </p>
                </div>
              </div>
            </details>

            {/* PRO TIPS */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl mb-6 border-2 border-yellow-400">
              <summary className="font-bold text-lg text-yellow-900 cursor-pointer mb-3">💡 PRO TIPS: Getting Fresh Angles (Click to Expand)</summary>
              <div className="mt-3 text-slate-700">
                <p className="mb-3 font-semibold">Same job, different video narratives:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div>
                    <strong className="text-yellow-700">🔄 Example: Plumbing Emergency</strong>
                  </div>

                  <div>
                    <strong>Scripts Version 1 - DRAMA/URGENCY:</strong>
                    <p className="text-sm ml-4 text-slate-600">Job Details: "2am emergency call - water flooding basement - shut off main line and extracted 400 gallons in 3 hours"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates suspenseful narratives with time-pressure hooks across all 5-7 scripts</p>
                  </div>

                  <div>
                    <strong>Scripts Version 2 - EXPERTISE/DIAGNOSTIC:</strong>
                    <p className="text-sm ml-4 text-slate-600">Job Details: "Diagnosed corroded pressure regulator that 3 plumbers missed - prevented $6K basement renovation"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI emphasizes diagnostic skills and expertise across all scripts</p>
                  </div>

                  <div>
                    <strong>Scripts Version 3 - CUSTOMER RELIEF:</strong>
                    <p className="text-sm ml-4 text-slate-600">Job Details: "Homeowner thought they needed $8K repipe - we fixed it for $320 valve replacement"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI focuses on customer savings and honest service across all scripts</p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-semibold text-yellow-900">
                  💡 Change your job details description to emphasize different story elements - you'll get 5-7 completely different script sets!
                </p>
              </div>
            </details>

            {/* HOW TO USE */}
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border-2 border-slate-300">
              <h3 className="text-slate-900 font-bold text-xl mb-4">📱 How to Use Your Video Scripts</h3>

              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500 mb-4">
                <p className="text-orange-900 text-sm font-bold">⚡ Your Roadmap says TUESDAY = Video Day. Generate scripts Monday, film Tuesday, post Tuesday evening.</p>
              </div>

              <div className="space-y-3 text-slate-700">
                <div>
                  <strong className="text-blue-600">Step 1:</strong> Pick 2-3 scripts from the generated set (don't need to film all 8!)
                </div>
                <div>
                  <strong className="text-blue-600">Step 2:</strong> Film clips following the shot-by-shot directions in each script
                </div>
                <div>
                  <strong className="text-blue-600">Step 3:</strong> Download CapCut (free!) and follow the guide above to edit
                </div>
                <div>
                  <strong className="text-blue-600">Step 4:</strong> Add text overlays as specified in the scripts — people watch without sound!
                </div>
                <div>
                  <strong className="text-blue-600">Step 5:</strong> Export and post: <strong>Facebook Reel on Tuesday</strong>, GBP video on Wednesday, embed on website Thursday
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-900 text-sm">
                  <strong>💡 Pro Tip:</strong> Film vertically (portrait) for Reels/TikTok/Shorts, horizontally (landscape) for Facebook feed and website.
                  One 30-min filming session = content for 2 weeks across all your platforms.
                </p>
              </div>

              <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-900 text-sm">
                  <strong>🔧 TOOL SYNC:</strong> Use the same job in <strong>📸 Before/After Story Generator</strong> for photo content and <strong>🔄 Job Pipeline</strong> for blog + social + review email. One great job + 3 tools = 2 weeks of content across every platform.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Business Type *</label>
                  <select id="vs_business_type" className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900">
                    <option value="">-- Select Your Trade --</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Target Market *</label>
                  <select id="vs_target_market" className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900">
                    <option value="">-- Select Your Market --</option>
                    {targetMarkets.map(market => (
                      <option key={market} value={market}>{market}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Job Details *</label>
                <textarea
                  id="vs_job_details"
                  rows="4"
                  placeholder="Describe the completed job in detail. Example: 'Emergency basement flood - extracted 400 gallons water, replaced sump pump, prevented $6K damage. Customer called at 2am, we arrived in 45 minutes.'"
                  className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Customer Name (Optional)</label>
                  <input
                    type="text"
                    id="vs_customer_name"
                    placeholder="e.g., 'Sarah' or 'The Johnson family'"
                    className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Your City/Area *</label>
                  <input
                    type="text"
                    id="vs_city"
                    placeholder="Harrisburg, Camp Hill, etc."
                    className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Photos/Videos Available?</label>
                <select id="vs_media" className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900">
                  <option value="yes">Yes - I have before/after photos or video clips</option>
                  <option value="no">No - I'll film everything fresh</option>
                </select>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
                <p className="text-amber-800 text-sm"><strong>⏱️ Heads Up:</strong> This generates up to 8 complete video scripts (~3,500 words). Please allow <strong>60-90 seconds</strong> — do not navigate away or press the button again. This is the heaviest tool in the suite.</p>
              </div>

              <button
                type="button"
                onClick={generateVideoScript}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800"
              >
                🎬 Generate Up to 8 Video Scripts
              </button>
            </div>

            {statusMessage && (
              <div className="mt-4 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-900">
                {statusMessage}
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-900">
                {error}
              </div>
            )}

            {output && (
              <>
                <div className="mt-6 bg-white border-2 border-blue-500 rounded-xl p-6 output-box" style={{boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)"}}>
                  {formatOutput(output)}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${copySuccess ? "bg-green-700" : "bg-green-600"} text-white`}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy All Scripts"}
                  </button>
                  <button
                    onClick={saveToLibrary}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${saveSuccess ? "bg-purple-700" : "bg-purple-600"} text-white`}
                  >
                    {saveSuccess ? "✅ Saved!" : "💾 Save to Library"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeModal === 'gmbPost' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-3xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">📍 Google Business Post Optimizer</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* WHAT IS THIS */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">📍 What Does This Tool Do?</h3>
              <p className="text-blue-900 leading-relaxed mb-3">
                This tool creates <strong>SEO-optimized posts for your Google Business Profile</strong> — that's your listing that shows up in Google Search and Google Maps when people search for services near them.
                AI writes posts with your city, landmarks, trade keywords, and a strong call-to-action so Google sees you as the most active business in your area.
              </p>
              <p className="text-blue-900 leading-relaxed">
                <strong>Why use it?</strong> 90% of your competitors have never posted to their Google listing. Businesses that post weekly get 70% more clicks. Every post is a free ad that appears directly in search results.
              </p>
              <div className="bg-blue-200 p-3 rounded-lg mt-3">
                <p className="text-blue-900 text-sm"><strong>📍 Not sure if you have one?</strong> Search your business name on Google. If you see a panel on the right with your address, phone number, and reviews — that's your Google Business Profile. You can manage it at <strong>business.google.com</strong></p>
              </div>
            </div>

            {/* PHOTO OPTIMIZATION CHECKLIST */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-6 border-2 border-green-400">
              <h3 className="text-green-900 font-bold text-xl mb-3">📸 PHOTO CHECKLIST - Before You Post!</h3>
              <p className="text-green-800 mb-4">Photos are 50% of the SEO power of a GBP post! Follow this checklist:</p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <span className="text-green-600 text-xl">✅</span>
                  <div className="text-sm">
                    <strong className="text-green-800">Photos are GEOTAGGED (GPS data included)</strong>
                    <p className="text-slate-600 mt-1">Take photos at job site with phone location ON, OR use GeoImgr.com to add GPS coordinates</p>
                    <p className="text-xs text-green-700 mt-1">💡 Why: Google verifies you work in that location - huge SEO boost!</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <span className="text-green-600 text-xl">✅</span>
                  <div className="text-sm">
                    <strong className="text-green-800">Photos taken AT actual job location (not stock photos)</strong>
                    <p className="text-slate-600 mt-1">Real job sites, your truck/van, your team, branded equipment</p>
                    <p className="text-red-600 text-xs mt-1">⚠️ Stock photos or home office photos HURT your rankings!</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <span className="text-green-600 text-xl">✅</span>
                  <div className="text-sm">
                    <strong className="text-green-800">High quality & well-lit (not blurry or dark)</strong>
                    <p className="text-slate-600 mt-1">Clear, bright photos get more clicks. Take multiple shots, pick the best.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <span className="text-green-600 text-xl">✅</span>
                  <div className="text-sm">
                    <strong className="text-green-800">Show your work, team, or branded equipment</strong>
                    <p className="text-slate-600 mt-1">Before/after shots, team in action, your van with logo visible</p>
                    <p className="text-xs text-green-700 mt-1">💡 Builds trust + shows you're legitimate</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <span className="text-green-600 text-xl">✅</span>
                  <div className="text-sm">
                    <strong className="text-green-800">Compressed for fast loading (use TinyPNG.com - free)</strong>
                    <p className="text-slate-600 mt-1">Large files slow down loading = lower rankings. Compress before uploading.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <span className="text-green-600 text-xl">✅</span>
                  <div className="text-sm">
                    <strong className="text-green-800">File named with keywords (not IMG_1234.jpg)</strong>
                    <p className="text-slate-600 mt-1">Example: "hvac-repair-philadelphia-jan-2024.jpg"</p>
                    <p className="text-xs text-green-700 mt-1">💡 Google reads filenames - use location + service keywords!</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-100 rounded-lg border-l-4 border-green-600">
                <p className="text-green-900 font-semibold text-sm">
                  📖 Need help with geotagging? Open "Getting Started" → Tier 1 → Google Business Profile section for detailed tutorial
                </p>
              </div>
            </div>

            {/* HOW TO USE */}
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border-2 border-slate-300">
              <h3 className="text-slate-900 font-bold text-xl mb-4">📱 How to Post to Your Google Business Listing</h3>

              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500 mb-4">
                <p className="text-orange-900 text-sm font-bold">⚡ Your Roadmap says MONDAY + WEDNESDAY = Google posting days. Monday = landmark hack post, Wednesday = photo upload + update.</p>
              </div>

              <div className="space-y-3 text-slate-700">
                <div>
                  <strong className="text-blue-600">Step 1:</strong> Go to <strong>business.google.com</strong> and sign in with the Google account linked to your business
                </div>
                <div>
                  <strong className="text-blue-600">Step 2:</strong> Click <strong>"Add Update"</strong> (or "Posts" in the left sidebar on desktop)
                </div>
                <div>
                  <strong className="text-blue-600">Step 3:</strong> Paste the AI-generated content into the post body
                </div>
                <div>
                  <strong className="text-blue-600">Step 4:</strong> Add a geotagged job photo (see Photo Checklist above)
                </div>
                <div>
                  <strong className="text-blue-600">Step 5:</strong> Select your CTA button (Call Now, Book Now, etc.) and click <strong>"Publish"</strong>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-900 text-sm">
                  <strong>💡 Pro Tip:</strong> Google posts expire after 7 days. That's why the Roadmap has you posting twice per week — your listing always has fresh content. Consistency beats volume.
                </p>
              </div>

              <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-900 text-sm">
                  <strong>🔧 TOOL SYNC:</strong> Use <strong>📍 Hyper-Local SEO → Landmark Cheat Sheet</strong> to find landmarks for your area, then enter them in the landmark field below. Use <strong>📸 Before/After Story Generator</strong> to create photo captions and alt-text before uploading job photos.
                </p>
              </div>
            </div>

            {/* PRO TIPS */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl mb-6 border-2 border-yellow-400">
              <summary className="font-bold text-lg text-yellow-900 cursor-pointer mb-3">💡 PRO TIPS: Getting Fresh Posts (Click to Expand)</summary>
              <div className="mt-3 text-slate-700">
                <p className="mb-3 font-semibold">Same service, different Google Business angles:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div>
                    <strong className="text-yellow-700">🔄 Example: AC Maintenance Service</strong>
                  </div>

                  <div>
                    <strong>Post 1 - NEW SERVICE LAUNCH:</strong>
                    <p className="text-sm ml-4 text-slate-600">Type: "What's New" | Details: "Just launched same-day AC diagnostic service"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates announcement-style post for Google Business</p>
                  </div>

                  <div>
                    <strong>Post 2 - SEASONAL OFFER:</strong>
                    <p className="text-sm ml-4 text-slate-600">Type: "Offer" | Details: "$89 pre-summer AC tune-up (reg $149)"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates promotional post with clear value prop</p>
                  </div>

                  <div>
                    <strong>Post 3 - EDUCATIONAL TIP:</strong>
                    <p className="text-sm ml-4 text-slate-600">Type: "Update" | Details: "3 signs your AC needs maintenance before summer"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates helpful educational content</p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-semibold text-yellow-900">
                  💡 Use different Post Types and vary your Details field for maximum variety on Google!
                </p>
              </div>
            </details>

            <div>
              <div className="mb-4">
                <label className="block font-bold mb-2">Business Type *</label>
                <select id="gmb_business_type" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">-- Select Your Trade --</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Target Market *</label>
                <select id="gmb_target_market" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">-- Select Your Market --</option>
                  {targetMarkets.map(market => (
                    <option key={market} value={market}>{market}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Your City/Area *</label>
                <input id="gmb_city" required className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="Harrisburg, Camp Hill, Mechanicsburg, etc." />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Post Type *</label>
                <select id="gmb_type" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">-- Select Post Type --</option>
                  <option>Job Completed</option>
                  <option>Landmark Hack Post</option>
                  <option>Seasonal Tip</option>
                  <option>Q&A / FAQ Answer</option>
                  <option>Photo Showcase</option>
                  <option>Special Offer</option>
                  <option>Service Highlight</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Specific Service (optional)</label>
                <input id="gmb_service" className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="e.g., Emergency water heater repair, AC tune-up, Roof inspection" />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Content Details</label>
                <textarea id="gmb_details" className="w-full p-3 border-2 border-slate-300 rounded-lg min-h-[80px]" placeholder="Add specific details about the job, tip, or offer..." />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">📍 Nearby Landmark or School (optional — SEO boost!)</label>
                <input id="gmb_landmark" className="w-full p-3 border-2 border-purple-300 rounded-lg bg-purple-50" placeholder="e.g., Near Hersheypark, 2 blocks from Lincoln Elementary, off Route 22" />
                <p className="text-xs text-purple-600 mt-1">💡 Mentioning a local landmark creates a "Geographic Anchor" that boosts local rankings</p>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">🌡️ Environmental Factor (optional — SEO boost!)</label>
                <input id="gmb_environmental" className="w-full p-3 border-2 border-green-300 rounded-lg bg-green-50" placeholder="e.g., Homes built before 1970, salt air corrosion, clay soil, post-storm damage" />
                <p className="text-xs text-green-600 mt-1">💡 Environmental context tells Google's AI WHY this area needs your service</p>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Call to Action *</label>
                <select id="gmb_cta" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">-- Select CTA Button --</option>
                  <option>Call Now</option>
                  <option>Book Now</option>
                  <option>Learn More</option>
                  <option>Get Quote</option>
                </select>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500 mb-4">
                <p className="text-amber-800 text-sm"><strong>⏱️ Heads Up:</strong> Please allow <strong>15-20 seconds</strong> for generation. Do not navigate away or press the button again.</p>
              </div>

              <button
                onClick={generateGMBPost}
                disabled={loading}
                className="btn w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📍 Generate Google Business Post
              </button>
            </div>

            {loading && (
              <div className="text-center py-10">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-slate-600">AI is optimizing your GBP post...</p>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-500 text-red-900 p-4 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

                        {output && (
              <>
                <div className="mt-6 bg-white border-2 border-blue-500 rounded-xl p-6 output-box" style={{boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)"}}>
                  {formatOutput(output)}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${copySuccess ? "bg-green-700" : "bg-green-600"} text-white`}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy to Clipboard"}
                  </button>
                  <button
                    onClick={saveToLibrary}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${saveSuccess ? "bg-purple-700" : "bg-purple-600"} text-white`}
                  >
                    {saveSuccess ? "✅ Saved!" : "💾 Save to Library"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeModal === 'competitorAnalysis' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-3xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">🔍 Competitor Analysis Tool</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* WHAT IS THIS */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">🔍 What Does This Tool Do?</h3>
              <p className="text-blue-900 leading-relaxed mb-3">
                This tool analyzes your competitor's ads and posts, then creates a <strong>superior version highlighting YOUR advantages</strong>.
                AI provides 2 parts: (1) Competitive analysis showing what works and what's missing, and (2) Your improved ad copy.
              </p>
              <p className="text-blue-900 leading-relaxed">
                <strong>Why use it?</strong> Learn from competitors' messaging, then beat them at their own game! Use their structure but execute it better with your unique advantages.
              </p>
            </div>

            {/* HOW TO USE */}
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border-2 border-slate-300">
              <h3 className="text-slate-900 font-bold text-xl mb-4">📱 How to Use Competitor Intel</h3>

              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500 mb-4">
                <p className="text-orange-900 text-sm font-bold">⚡ Your Roadmap says MONDAY = 5-min Competitor Quick-Check and SATURDAY = Monthly Competitor Deep-Dive</p>
              </div>

              <div className="space-y-3 text-slate-700">
                <div>
                  <strong className="text-blue-600">Step 1 — Find their ads:</strong> Go to <strong><a href="https://www.facebook.com/ads/library" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">facebook.com/ads/library</a></strong> → search your trade + city → see exactly what competitors are running. Also check their Google listing and website.
                </div>
                <div>
                  <strong className="text-blue-600">Step 2:</strong> Copy/paste their ad text, Google listing, or Facebook post into the tool
                </div>
                <div>
                  <strong className="text-blue-600">Step 3:</strong> List YOUR competitive advantages (use the helper list below the field if you're not sure)
                </div>
                <div>
                  <strong className="text-blue-600">Step 4:</strong> AI analyzes what works, what's missing, and creates your superior version
                </div>
                <div>
                  <strong className="text-blue-600">Step 5:</strong> Use the improved copy for your Google Business posts, Facebook posts, website, or paid ads
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-900 text-sm">
                  <strong>💡 Pro Tip:</strong> Do this monthly on Saturday (Deep-Dive day). Competitors change messaging — stay ahead by continuously monitoring and improving your copy. The <strong>🕵️ Competitor Intel Guide</strong> has a full walkthrough of the Facebook Ad Library spy method.
                </p>
              </div>

              <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-900 text-sm">
                  <strong>🔧 TOOL SYNC:</strong> Take the improved ad copy and run it through the <strong>📍 Google Business Post Optimizer</strong> for a Google-ready version, or use it as the "Job Details" in <strong>🔥 One Job = One Week</strong> to generate platform-specific posts. The analysis insights also feed into your <strong>🛡️ Authority Builder</strong> positioning.
                </p>
              </div>
            </div>

            {/* PRO TIPS */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl mb-6 border-2 border-yellow-400">
              <summary className="font-bold text-lg text-yellow-900 cursor-pointer mb-3">💡 PRO TIPS: Getting Fresh Analysis (Click to Expand)</summary>
              <div className="mt-3 text-slate-700">
                <p className="mb-3 font-semibold">Same competitor, different competitive advantages to emphasize:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div>
                    <strong className="text-yellow-700">🔄 Example: Analyzing Competitor's HVAC Ad</strong>
                  </div>

                  <div>
                    <strong>Round 1 - SPEED ADVANTAGE:</strong>
                    <p className="text-sm ml-4 text-slate-600">Your Advantages: "Same-day emergency service, 2-hour response guarantee, 24/7 availability"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates response focused on your faster service</p>
                  </div>

                  <div>
                    <strong>Round 2 - EXPERTISE ADVANTAGE:</strong>
                    <p className="text-sm ml-4 text-slate-600">Your Advantages: "15 years experience, master-certified technicians, specialized in historic homes"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates response emphasizing your superior qualifications</p>
                  </div>

                  <div>
                    <strong>Round 3 - VALUE ADVANTAGE:</strong>
                    <p className="text-sm ml-4 text-slate-600">Your Advantages: "Lifetime warranty on parts, 0% financing, price-match guarantee"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates response focusing on your better value proposition</p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-semibold text-yellow-900">
                  💡 Highlight different competitive advantages each time to test which messaging resonates best!
                </p>
              </div>
            </details>

            <div>
              <div className="mb-4">
                <label className="block font-bold mb-2">Business Type *</label>
                <select id="ci_business_type" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">-- Select Your Trade --</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Target Market *</label>
                <select id="ci_target_market" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">-- Select Your Market --</option>
                  {targetMarkets.map(market => (
                    <option key={market} value={market}>{market}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Competitor's Ad/Post *</label>
                <textarea id="ci_ad" required className="w-full p-3 border-2 border-slate-300 rounded-lg min-h-[120px]" placeholder="Paste the competitor's Google ad, Facebook post, or website copy here..." />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Your Competitive Advantages *</label>
                <textarea id="ci_advantages" required className="w-full p-3 border-2 border-slate-300 rounded-lg min-h-[100px]" placeholder="List what makes you better than this competitor. Pick from the examples below or write your own..." />
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-900 text-xs font-bold mb-2">💡 Not sure? Pick any that apply to you (copy and paste):</p>
                  <div className="grid grid-cols-2 gap-1 text-xs text-blue-800">
                    <span>• Faster response time</span>
                    <span>• Same-day / next-day service</span>
                    <span>• More years in business</span>
                    <span>• Upfront / transparent pricing</span>
                    <span>• Licensed, bonded & insured</span>
                    <span>• Locally owned & operated</span>
                    <span>• Better warranties / guarantees</span>
                    <span>• More Google reviews</span>
                    <span>• Specialized training / certifications</span>
                    <span>• Newer / better equipment</span>
                    <span>• Free estimates (on-site)</span>
                    <span>• 24/7 emergency availability</span>
                    <span>• Bilingual team</span>
                    <span>• Financing available</span>
                    <span>• Background-checked employees</span>
                    <span>• Eco-friendly / green practices</span>
                  </div>
                  <p className="text-blue-700 text-xs mt-2 italic">Even 2-3 advantages will produce a strong analysis. The more specific you are, the better the output.</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Your City *</label>
                <input id="ci_city" required className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="Harrisburg" />
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500 mb-4">
                <p className="text-amber-800 text-sm"><strong>⏱️ Heads Up:</strong> This generates a full competitive analysis + rewritten ad. Please allow <strong>30-45 seconds</strong> — do not navigate away or press the button again.</p>
              </div>

              <button
                onClick={generateCompetitorIntel}
                disabled={loading}
                className="btn w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔍 Analyze & Improve
              </button>
            </div>

            {loading && (
              <div className="text-center py-10">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-slate-600">AI is analyzing competitor and creating better version...</p>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-500 text-red-900 p-4 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

                        {output && (
              <>
                <div className="mt-6 bg-white border-2 border-blue-500 rounded-xl p-6 output-box" style={{boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)"}}>
                  {formatOutput(output)}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${copySuccess ? "bg-green-700" : "bg-green-600"} text-white`}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy to Clipboard"}
                  </button>
                  <button
                    onClick={saveToLibrary}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${saveSuccess ? "bg-purple-700" : "bg-purple-600"} text-white`}
                  >
                    {saveSuccess ? "✅ Saved!" : "💾 Save to Library"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeModal === 'reviewMax' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-3xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">⭐ Review Maximizer</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* WHAT IS THIS */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">⭐ What Does This Tool Do?</h3>
              <p className="text-blue-900 leading-relaxed mb-3">
                This tool takes <strong>one 5-star review and creates 4 marketing assets</strong>: (1) Social media post featuring the review,
                (2) Referral request email to the customer with incentives, (3) Google Business update showcasing the success story, and (4) <strong>Keyword-Rich Review Reply</strong> — a ready-to-paste response to the review that's stuffed with SEO keywords so the review + your reply rank higher together.
              </p>
              <p className="text-blue-900 leading-relaxed">
                <strong>Why use it?</strong> Reviews are gold! This squeezes maximum value from every 5-star review - turning happy customers into marketing content AND referral sources.
              </p>
            </div>

            {/* HOW TO USE */}
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border-2 border-slate-300">
              <h3 className="text-slate-900 font-bold text-xl mb-4">📱 How to Maximize Every Review</h3>

              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500 mb-4">
                <p className="text-orange-900 text-sm font-bold">⚡ Your Roadmap says FRIDAY = Social Proof Day. Run every new 5-star review through this tool immediately, then deploy the assets on Friday.</p>
              </div>

              <div className="space-y-3 text-slate-700">
                <div>
                  <strong className="text-blue-600">Asset #1 — Social Media Post:</strong> Post to Facebook/Nextdoor on Friday (Social Proof Day). Customer testimonials get 2-3x more engagement than promotional posts.
                </div>
                <div>
                  <strong className="text-blue-600">Asset #2 — Referral Request Email:</strong> Send to the customer IMMEDIATELY after they leave the review — while they're happiest. The $50 referral incentive drives word-of-mouth.
                </div>
                <div>
                  <strong className="text-blue-600">Asset #3 — Google Business Update:</strong> Post to your Google Business listing on Monday or Wednesday (your Google posting days per the Roadmap).
                </div>
                <div>
                  <strong className="text-blue-600">Asset #4 — Review Reply:</strong> Paste as your public response to the review on Google/Yelp/Facebook RIGHT AWAY. Packed with SEO keywords that sound natural — the review + your reply rank higher together.
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-900 text-sm">
                  <strong>💡 Pro Tip:</strong> Run this within 24 hours of getting a 5-star review. Strike while the customer is happiest and most likely to refer. One great review = content for an entire week across 4 platforms.
                </p>
              </div>

              <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-900 text-sm">
                  <strong>🔧 TOOL SYNC:</strong> After running a review through here, use the same job details in <strong>📸 Before/After Story Generator</strong> for a photo post and <strong>🔄 Job Pipeline</strong> for a blog + additional social content. One happy customer = a full week of marketing.
                </p>
              </div>
            </div>

            {/* PRO TIPS */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl mb-6 border-2 border-yellow-400">
              <summary className="font-bold text-lg text-yellow-900 cursor-pointer mb-3">💡 PRO TIPS: Getting Fresh Angles (Click to Expand)</summary>
              <div className="mt-3 text-slate-700">
                <p className="mb-3 font-semibold">Same review, different marketing angles:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div>
                    <strong className="text-yellow-700">🔄 Example: 5-Star Review for Roof Repair</strong>
                  </div>

                  <div>
                    <strong>Version 1 - QUOTE CUSTOMER ON SPEED:</strong>
                    <p className="text-sm ml-4 text-slate-600">Service: "Emergency roof repair - completed same day"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI pulls quote about fast response and creates urgency-focused assets</p>
                  </div>

                  <div>
                    <strong>Version 2 - QUOTE CUSTOMER ON QUALITY:</strong>
                    <p className="text-sm ml-4 text-slate-600">Service: "Roof repair - superior craftsmanship and attention to detail"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI pulls quote about quality work and creates expertise-focused assets</p>
                  </div>

                  <div>
                    <strong>Version 3 - QUOTE CUSTOMER ON PRICE:</strong>
                    <p className="text-sm ml-4 text-slate-600">Service: "Roof repair - fair pricing and honest assessment"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI pulls quote about value and creates trust-focused assets</p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-semibold text-yellow-900">
                  💡 Vary the "Service Provided" description to steer which part of the review gets emphasized!
                </p>
              </div>
            </details>

            <div>
              <div className="mb-4">
                <label className="block font-bold mb-2">Business Type *</label>
                <select id="rm_business_type" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">-- Select Your Trade --</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Target Market *</label>
                <select id="rm_target_market" required className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">-- Select Your Market --</option>
                  {targetMarkets.map(market => (
                    <option key={market} value={market}>{market}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">5-Star Review *</label>
                <textarea id="rm_review" required className="w-full p-3 border-2 border-slate-300 rounded-lg min-h-[120px]" placeholder="Paste the customer's review here..." />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Customer Name *</label>
                <input id="rm_customer" required className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="Sarah, John Smith, etc." />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Customer Email <span className="text-slate-400 font-normal text-sm">(Optional)</span></label>
                <input id="rm_email" type="email" className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="customer@email.com" />
                <p className="text-xs text-slate-500 mt-1">📧 This does NOT send any email automatically. The address just appears in the referral email output so you can copy it when you send it yourself.</p>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Service Provided *</label>
                <input id="rm_service" required className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="e.g., HVAC repair, Plumbing service, Roof replacement" />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Your City/Area *</label>
                <input id="rm_city" required className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="Harrisburg, Camp Hill, Mechanicsburg, etc." />
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500 mb-4">
                <p className="text-amber-800 text-sm"><strong>⏱️ Heads Up:</strong> This generates 4 marketing assets. Please allow <strong>25-35 seconds</strong> — do not navigate away or press the button again.</p>
              </div>

              <button
                onClick={generateReviewMax}
                disabled={loading}
                className="btn w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⭐ Generate 4 Marketing Assets
              </button>
            </div>

            {loading && (
              <div className="text-center py-10">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-slate-600">AI is creating your review marketing assets...</p>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-500 text-red-900 p-4 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

                        {output && (
              <>
                <div className="mt-6 bg-white border-2 border-blue-500 rounded-xl p-6 output-box" style={{boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)"}}>
                  {formatOutput(output)}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${copySuccess ? "bg-green-700" : "bg-green-600"} text-white`}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy to Clipboard"}
                  </button>
                  <button
                    onClick={saveToLibrary}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${saveSuccess ? "bg-purple-700" : "bg-purple-600"} text-white`}
                  >
                    {saveSuccess ? "✅ Saved!" : "💾 Save to Library"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* DAILY TIP GENERATOR MODAL */}
      {activeModal === 'dailyTip' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-4xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">💡 Daily Tip Generator</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* WHAT IS THIS */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">💡 What Does This Tool Do?</h3>
              <p className="text-blue-900 leading-relaxed mb-3">
                This tool generates <strong>expert tips that educate your customers and build trust</strong>. Educational content gets 2x more engagement than promotional posts and positions you as the helpful expert, not just a vendor.
              </p>
              <p className="text-blue-900 leading-relaxed">
                <strong>Why use it?</strong> People SAVE helpful tips → algorithm boost. They share tips with friends → more reach. You become the trusted advisor they call when they need help.
              </p>
            </div>

            {/* HOW TO USE */}
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border-2 border-slate-300">
              <h3 className="text-slate-900 font-bold text-xl mb-4">📱 How to Use Your Expert Tips</h3>

              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500 mb-4">
                <p className="text-orange-900 text-sm font-bold">⚡ Your Roadmap says educational content fills gaps between job posts. Use tips on slow days when you don't have fresh job photos — keeps your feed active all month.</p>
              </div>

              <div className="space-y-3 text-slate-700">
                <div>
                  <strong className="text-blue-600">Step 1:</strong> Generate 5-30 tips at once to build a content bank
                </div>
                <div>
                  <strong className="text-blue-600">Step 2:</strong> Save them to your Content Library (💾 button below output)
                </div>
                <div>
                  <strong className="text-blue-600">Step 3:</strong> Post 1 tip per day on <strong>Facebook</strong>, <strong>Nextdoor</strong>, or <strong>Google Business</strong> — especially on days without job content
                </div>
                <div>
                  <strong className="text-blue-600">Step 4:</strong> Track which categories perform best (Cost-Saving = saves, Safety = shares, DIY vs Pro = comments)
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-900 text-sm">
                  <strong>💡 Pro Tip:</strong> Generate 30 tips once per month → schedule 1 per day → never run out of content. Recycle your best tips every 3-6 months.
                </p>
              </div>

              <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-900 text-sm">
                  <strong>🔧 TOOL SYNC:</strong> Pair tips with job content from <strong>🔄 Job Pipeline</strong> or <strong>🔥 One Job = One Week</strong>. Monday = job post, Tuesday = video, Wednesday = tip, Thursday = blog. Tips fill the content calendar gaps.
                </p>
              </div>
            </div>

            {/* PRO TIPS */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl mb-6 border-2 border-yellow-400">
              <summary className="font-bold text-lg text-yellow-900 cursor-pointer mb-3">💡 PRO TIPS: How to Use Daily Tips (Click to Expand)</summary>
              <div className="mt-3 text-slate-700 space-y-3">
                <div>
                  <strong className="text-yellow-700">🎯 Strategy: Generate 30 Tips at Once</strong>
                  <p className="text-sm ml-4 mt-1">Generate 30 tips, save them, and schedule 1 per day for the entire month. Never run out of content!</p>
                </div>

                <div>
                  <strong className="text-yellow-700">♻️ Recycle Tips</strong>
                  <p className="text-sm ml-4 mt-1">Save your best-performing tips. Repost them 3-6 months later (most followers won't remember).</p>
                </div>

                <div>
                  <strong className="text-yellow-700">📊 Track What Works</strong>
                  <p className="text-sm ml-4 mt-1">
                    Cost-saving tips get SAVED (algorithm loves this). Safety tips get SHARED (helps reach new people). DIY vs Pro tips get COMMENTS (builds engagement).
                  </p>
                </div>
              </div>
            </details>

            {/* FORM */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block font-bold mb-2">Business Type *</label>
                <select id="dt_business_type" className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">-- Select Your Trade --</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">Your City/Area *</label>
                <input id="dt_city" className="w-full p-3 border-2 border-slate-300 rounded-lg" placeholder="Harrisburg, Camp Hill, Mechanicsburg, etc." />
              </div>

              <div>
                <label className="block font-bold mb-2">Tip Category *</label>
                <select id="dt_category" className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">Select tip category...</option>
                  <option value="Preventive Maintenance">Preventive Maintenance</option>
                  <option value="Safety Tips">Safety Tips</option>
                  <option value="Cost-Saving Tips">Cost-Saving Tips</option>
                  <option value="DIY vs Professional">DIY vs Professional</option>
                  <option value="Seasonal Tips">Seasonal Tips</option>
                  <option value="Common Mistakes to Avoid">Common Mistakes to Avoid</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">Tone *</label>
                <select id="dt_tone" className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="">Select tone...</option>
                  <option value="Educational">Educational (Factual, authoritative)</option>
                  <option value="Friendly">Friendly (Warm, encouraging)</option>
                  <option value="Urgent">Urgent (Don't wait, act now)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">Number of Tips</label>
                <select id="dt_number" className="w-full p-3 border-2 border-slate-300 rounded-lg">
                  <option value="1">1 Tip</option>
                  <option value="5">5 Tips</option>
                  <option value="10">10 Tips</option>
                  <option value="30">30 Tips (Full Month!)</option>
                </select>
              </div>
            </div>

            {/* GENERATE BUTTON */}
            <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500 mb-4">
              <p className="text-amber-800 text-sm"><strong>⏱️ Heads Up:</strong> 1 tip = ~10 seconds. 5 tips = ~20 seconds. 10 tips = ~35 seconds. <strong>30 tips = 60-90 seconds</strong> (heaviest option — do not navigate away).</p>
            </div>

            <button
              onClick={generateDailyTip}
              disabled={loading}
              className="btn w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💡 Generate Expert Tips
            </button>

            {loading && (
              <div className="text-center py-10">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-slate-600">AI is generating your expert tips...</p>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-500 text-red-900 p-4 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

            {output && (
              <>
                <div className="mt-6 bg-white border-2 border-blue-500 rounded-xl p-6 output-box" style={{boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)"}}>
                  {formatOutput(output)}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${copySuccess ? "bg-green-700" : "bg-green-600"} text-white`}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy to Clipboard"}
                  </button>
                  <button
                    onClick={saveToLibrary}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${saveSuccess ? "bg-purple-700" : "bg-purple-600"} text-white`}
                  >
                    {saveSuccess ? "✅ Saved!" : "💾 Save to Library"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* EMAIL CAMPAIGN BUILDER MODAL */}
      {activeModal === 'emailCampaign' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-4xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">📧 Email Campaign Builder</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* WHAT IS THIS */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">📧 What Does This Tool Do?</h3>
              <p className="text-blue-900 leading-relaxed mb-3">
                Creates <strong>complete email sequences</strong> for any campaign type: monthly newsletters, seasonal promotions,
                customer reactivation, or post-service nurture. Each sequence includes multiple emails with subject lines, timing, and CTAs.
              </p>
              <p className="text-blue-900 leading-relaxed">
                <strong>Why use it?</strong> Email is the ONLY marketing channel you OWN (not controlled by algorithms).
                Direct line to customers = direct revenue. Build loyalty and repeat business automatically!
              </p>
            </div>

            {/* HOW TO USE */}
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border-2 border-slate-300">
              <h3 className="text-slate-900 font-bold text-xl mb-4">📧 How to Use Your Email Campaign</h3>

              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500 mb-4">
                <p className="text-orange-900 text-sm font-bold">⚡ Your Roadmap says SATURDAY = Deep-Dive Day. Build your email campaigns on Saturday when you have time to think strategically, then schedule the sends for the week ahead.</p>
              </div>

              <div className="space-y-3 text-slate-700">
                <div>
                  <strong className="text-blue-600">Step 1:</strong> Choose your campaign type and offer/focus, then generate
                </div>
                <div>
                  <strong className="text-blue-600">Step 2:</strong> Copy the entire sequence to your email tool (Mailchimp, Constant Contact, or even Gmail)
                </div>
                <div>
                  <strong className="text-blue-600">Step 3:</strong> Replace [First Name], [PHONE], and [Company Name] placeholders
                </div>
                <div>
                  <strong className="text-blue-600">Step 4:</strong> Schedule sends following the timing built into each email (e.g., Email 2 = 1 week later)
                </div>
                <div>
                  <strong className="text-blue-600">Step 5:</strong> Track opens and clicks — tweak subject lines for better performance
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-900 text-sm">
                  <strong>💡 Pro Tip:</strong> Build your email list by adding a "Join our newsletter" checkbox to every invoice and estimate.
                  Offer a small incentive like "$25 off your next service for subscribers."
                </p>
              </div>

              <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-900 text-sm">
                  <strong>🔧 TOOL SYNC:</strong> Use the <strong>⭐ Review Maximizer</strong> to turn 5-star reviews into email testimonials. Use <strong>🌦️ Weather Alert</strong> seasonal messaging as campaign themes. Run <strong>🔍 Competitor Analysis</strong> to find positioning angles for your offers. <strong>💥 Going bigger?</strong> Use the <strong>🎯 Seasonal Campaign Builder</strong> to generate a complete multi-channel campaign (emails + social + flyer + texts + GBP post + execution checklist) in one click.
                </p>
              </div>
            </div>

            {/* PRO TIPS */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl mb-6 border-2 border-yellow-400">
              <summary className="font-bold text-lg text-yellow-900 cursor-pointer mb-3">💡 PRO TIPS: Getting Fresh Campaigns (Click to Expand)</summary>
              <div className="mt-3 text-slate-700">
                <p className="mb-3 font-semibold">Same campaign type, different strategic focus:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div>
                    <strong className="text-yellow-700">🔄 Example: Seasonal Campaign for HVAC</strong>
                  </div>

                  <div>
                    <strong>Campaign 1 - COST SAVINGS FOCUS:</strong>
                    <p className="text-sm ml-4 text-slate-600">Offer: "Pre-season tune-up saves 30% on energy bills + extends equipment life 5 years"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI emphasizes long-term ROI and preventive value</p>
                  </div>

                  <div>
                    <strong>Campaign 2 - URGENCY/SCARCITY FOCUS:</strong>
                    <p className="text-sm ml-4 text-slate-600">Offer: "Only 15 spring tune-up slots left - book before April 15 heat wave hits"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI emphasizes limited availability and seasonal timing pressure</p>
                  </div>

                  <div>
                    <strong>Campaign 3 - PROBLEM PREVENTION FOCUS:</strong>
                    <p className="text-sm ml-4 text-slate-600">Offer: "Prevent $2,500 emergency AC failures - pre-summer inspection catches 90% of issues"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI emphasizes risk mitigation and avoiding expensive emergencies</p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-semibold text-yellow-900">
                  💡 Change your offer/focus description to emphasize different benefits and get varied campaigns!
                </p>
              </div>
            </details>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Business Type *</label>
                  <select id="ec_business_type" className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900">
                    <option value="">-- Select Your Trade --</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Target Market *</label>
                  <select id="ec_target_market" className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900">
                    <option value="">-- Select Your Market --</option>
                    {targetMarkets.map(market => (
                      <option key={market} value={market}>{market}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Campaign Type *</label>
                  <select id="ec_campaign_type" className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900">
                    <option value="">-- Select Campaign Type --</option>
                    <option value="Newsletter">Newsletter (Monthly Tips)</option>
                    <option value="Seasonal Campaign">Seasonal Campaign (Promo/Offer)</option>
                    <option value="Reactivation">Reactivation (Win Back Old Customers)</option>
                    <option value="Nurture Sequence">Nurture Sequence (Post-Service Follow-up)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Timeframe/Season *</label>
                  <input
                    type="text"
                    id="ec_timeframe"
                    placeholder="e.g., 'April 2026' or 'Spring' or 'Summer heat season'"
                    className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Your City/Area *</label>
                <input
                  type="text"
                  id="ec_city"
                  placeholder="Harrisburg, Camp Hill, Mechanicsburg, etc."
                  className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Offer/Campaign Focus (Optional but Recommended)</label>
                <textarea
                  id="ec_offer"
                  rows="3"
                  placeholder="e.g., '$99 spring AC tune-up special' or 'Educational tips about winter furnace maintenance' or 'We haven't seen you in 2 years - comeback discount'"
                  className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500 mb-4">
                <p className="text-amber-800 text-sm"><strong>⏱️ Heads Up:</strong> Full email sequences take <strong>30-40 seconds</strong> to generate. Please don't navigate away or press the button again.</p>
              </div>

              <button
                type="button"
                onClick={generateEmailCampaign}
                disabled={loading}
                className="btn w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📧 Generate Email Campaign
              </button>
            </div>

            {statusMessage && (
              <div className="mt-4 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-900">
                {statusMessage}
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-900">
                {error}
              </div>
            )}

            {output && (
              <>
                <div className="mt-6 bg-white border-2 border-blue-500 rounded-xl p-6 output-box" style={{boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)"}}>
                  {formatOutput(output)}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${copySuccess ? "bg-green-700" : "bg-green-600"} text-white`}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy to Clipboard"}
                  </button>
                  <button
                    onClick={saveToLibrary}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${saveSuccess ? "bg-purple-700" : "bg-purple-600"} text-white`}
                  >
                    {saveSuccess ? "✅ Saved!" : "💾 Save to Library"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* FAQ/WEBSITE CONTENT GENERATOR MODAL */}
      {activeModal === 'faqGenerator' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-4xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">❓ FAQ/Website Content Generator</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* WHAT IS THIS */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">❓ What Does This Tool Do?</h3>
              <p className="text-blue-900 leading-relaxed mb-3">
                This tool <strong>automatically identifies the questions your customers are searching for on Google</strong> about your trade in your area — then creates a complete, SEO-optimized FAQ page answering all of them. You also get ready-to-paste Google Business Q&A pairs.
              </p>
              <p className="text-blue-900 leading-relaxed">
                <strong>Why use it?</strong> FAQ pages rank in Google for "how much does X cost" searches. They answer customer questions 24/7 while you sleep. They pre-sell your services before anyone picks up the phone. One FAQ page can bring in leads for years.
              </p>
            </div>

            {/* HOW TO USE */}
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border-2 border-slate-300">
              <h3 className="text-slate-900 font-bold text-xl mb-4">🌐 How to Use Your FAQ Content</h3>

              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500 mb-4">
                <p className="text-orange-900 text-sm font-bold">⚡ Your Roadmap says SATURDAY = Deep-Dive Day. Build your FAQ pages on Saturday, then add them to your website during the week. One FAQ page per month = 12 pages of free SEO content per year.</p>
              </div>

              <div className="space-y-3 text-slate-700">
                <div>
                  <strong className="text-blue-600">Part 1 — Website FAQ Page:</strong> Copy the full FAQ page and add it to your website (WordPress, Wix, Squarespace, etc.). Use the exact H1 title and meta description provided — they're optimized for Google.
                </div>
                <div>
                  <strong className="text-blue-600">Part 2 — Google Business Q&A:</strong> Have a friend ask each question on your Google listing, then paste the answers as your official response. Takes 10-15 minutes and dramatically boosts your Google presence.
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-900 text-sm">
                  <strong>💡 Pro Tip:</strong> Run this tool once per month with your same trade and city. Each run generates different questions. After 6 months you'll have 60+ FAQ answers covering every question a customer could ask — all ranking in Google.
                </p>
              </div>

              <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-900 text-sm">
                  <strong>🔧 TOOL SYNC:</strong> Use FAQ answers as seeds for <strong>💡 Daily Tip Generator</strong> posts. Turn pricing FAQs into <strong>📧 Email Campaign</strong> content. Reference FAQ answers in your <strong>📝 Google Business Post Optimizer</strong> updates.
                </p>
              </div>
            </div>

            {/* PRO TIPS */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl mb-6 border-2 border-yellow-400">
              <summary className="font-bold text-lg text-yellow-900 cursor-pointer mb-3">💡 PRO TIPS: Getting Maximum SEO Value (Click to Expand)</summary>
              <div className="mt-3 text-slate-700 space-y-3">
                <div>
                  <strong className="text-yellow-700">🎯 Run It Monthly</strong>
                  <p className="text-sm ml-4 mt-1">Each run generates different questions based on your trade. Run monthly to build a library of FAQ pages that cover every possible search.</p>
                </div>

                <div>
                  <strong className="text-yellow-700">🔗 Link Pages Together</strong>
                  <p className="text-sm ml-4 mt-1">Link FAQ pages to each other and from your homepage. This creates a "content hub" that Google loves — dramatically boosting all your pages.</p>
                </div>

                <div>
                  <strong className="text-yellow-700">📊 Track What Ranks</strong>
                  <p className="text-sm ml-4 mt-1">After 30 days, Google your FAQ page titles. If they appear on page 1-2, that page is working. Double down by adding more detail to those answers.</p>
                </div>
              </div>
            </details>

            {/* FORM */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Business Type *</label>
                  <select id="faq_business_type" className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900">
                    <option value="">-- Select Your Trade --</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Target Market *</label>
                  <select id="faq_target_market" className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900">
                    <option value="">-- Select Your Market --</option>
                    {targetMarkets.map(market => (
                      <option key={market} value={market}>{market}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Your City/Area *</label>
                <input
                  type="text"
                  id="faq_city"
                  placeholder="Harrisburg, Camp Hill, Mechanicsburg, etc."
                  className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
                <p className="text-amber-800 text-sm"><strong>⏱️ Heads Up:</strong> This generates a complete FAQ page + Google Business Q&A pairs. Please allow <strong>45-60 seconds</strong> — do not navigate away or press the button again.</p>
              </div>

              <button
                type="button"
                onClick={generateFAQ}
                disabled={loading}
                className="btn w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ❓ Generate FAQ Page
              </button>
            </div>

            {loading && (
              <div className="text-center py-10">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-slate-600">AI is identifying the most searched questions for your trade and building your FAQ page...</p>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-500 text-red-900 p-4 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

            {output && (
              <>
                <div className="mt-6 bg-white border-2 border-blue-500 rounded-xl p-6 output-box" style={{boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)"}}>
                  {formatOutput(output)}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${copySuccess ? "bg-green-700" : "bg-green-600"} text-white`}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy to Clipboard"}
                  </button>
                  <button
                    onClick={saveToLibrary}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${saveSuccess ? "bg-purple-700" : "bg-purple-600"} text-white`}
                  >
                    {saveSuccess ? "✅ Saved!" : "💾 Save to Library"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* OBJECTION HANDLER SCRIPTS MODAL */}
      {activeModal === 'objectionHandler' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-4xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">💬 Objection Handler Scripts</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* WHAT IS THIS */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">💬 What Does This Tool Do?</h3>
              <p className="text-blue-900 leading-relaxed mb-3">
                Creates <strong>persuasive response scripts</strong> for common sales objections like "You're too expensive,"
                "I need to get 3 quotes," or "I want to think about it." <strong>NEW: Also handles Post-Service Recovery</strong> when a customer gives a low rating (1-8) on your satisfaction survey.
              </p>
              <p className="text-blue-900 leading-relaxed">
                <strong>Why use it?</strong> DIRECT revenue impact! Most jobs are lost because of weak objection handling, not bad work.
                Turn more estimates into bookings AND save relationships before they hit Google with a bad review!
              </p>
            </div>

            {/* SERVICE RECOVERY CALLOUT */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-5 rounded-xl mb-6 border-2 border-red-400">
              <h3 className="text-red-900 font-bold text-lg mb-2">⭐ NEW: Service Recovery Scripts (For 1-8 Ratings)</h3>
              <p className="text-red-800 text-sm mb-3">
                When a customer responds with a 1-8 on your "Pre-Review Qualifier," use the <strong>Post-Service</strong> options to generate scripts that:
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-bold text-red-700 text-sm">📱 Phone Script</p>
                  <p className="text-xs text-slate-600">The "Immediate Save" - stop them from venting on Google</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-bold text-orange-700 text-sm">✉️ Text/Email Script</p>
                  <p className="text-xs text-slate-600">The "Private Feedback Loop" - move complaints to a private channel</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-bold text-green-700 text-sm">🤝 In-Person Script</p>
                  <p className="text-xs text-slate-600">The "Second Chance 5-Star" - turn a 3 into a loyal 5</p>
                </div>
              </div>
              <p className="text-xs text-red-700 mt-3 italic">💡 Many 3-star reviews happen from small misunderstandings. Catch it in the Qualifier phase = potential 3-star becomes loyal 5-star!</p>
            </div>

            {/* HOW TO USE */}
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border-2 border-slate-300">
              <h3 className="text-slate-900 font-bold text-xl mb-4">📱 How to Use Your Objection Scripts</h3>

              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500 mb-4">
                <p className="text-orange-900 text-sm font-bold">⚡ Your Roadmap says SATURDAY = Deep-Dive Day. Generate scripts for your top 5 objections on Saturday, then practice them during the week. By next Saturday, you'll close more jobs on autopilot.</p>
              </div>

              <div className="space-y-3 text-slate-700">
                <div>
                  <strong className="text-blue-600">📞 Phone Script:</strong> Don't memorize word-for-word. Learn the FLOW: Acknowledge → Reframe → Evidence → Close. Practice out loud 3-5 times until it feels natural.
                </div>
                <div>
                  <strong className="text-blue-600">📧 Email/Text Script:</strong> Save as a template in your phone's notes or CRM. When you hear the objection, send within 2 hours while the conversation is fresh.
                </div>
                <div>
                  <strong className="text-blue-600">🤝 In-Person Script:</strong> Role-play with a coworker or family member. Focus on confidence and eye contact, not exact words.
                </div>
                <div>
                  <strong className="text-blue-600">🔥 Quick Comebacks:</strong> Memorize these cold. They buy you 5 seconds to think and keep you in control of the conversation.
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-900 text-sm">
                  <strong>💡 Pro Tip:</strong> Track which objections you hear most often this week. Generate scripts for your top 5 and practice one per day.
                  Confidence in handling objections = higher close rates.
                </p>
              </div>

              <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-900 text-sm">
                  <strong>🔧 TOOL SYNC:</strong> Use <strong>🔍 Competitor Analysis</strong> to find positioning angles for your scripts. Use <strong>⭐ Review Maximizer</strong> to turn recovered customers into 5-star reviews. Feed your best comebacks into <strong>📧 Email Campaign</strong> follow-ups.
                </p>
              </div>
            </div>

            {/* PRO TIPS */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl mb-6 border-2 border-yellow-400">
              <summary className="font-bold text-lg text-yellow-900 cursor-pointer mb-3">💡 PRO TIPS: Getting Fresh Scripts (Click to Expand)</summary>
              <div className="mt-3 text-slate-700">
                <p className="mb-3 font-semibold">Same objection, different competitive angles:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div>
                    <strong className="text-yellow-700">🔄 Example: "You're too expensive" Objection</strong>
                  </div>

                  <div>
                    <strong>Script Set 1 - WARRANTY ADVANTAGE:</strong>
                    <p className="text-sm ml-4 text-slate-600">Your Advantage: "Lifetime warranty on parts + 5-year labor guarantee"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates scripts emphasizing risk mitigation and long-term value protection</p>
                  </div>

                  <div>
                    <strong>Script Set 2 - SPEED ADVANTAGE:</strong>
                    <p className="text-sm ml-4 text-slate-600">Your Advantage: "Same-day service, 2-hour response time, never reschedule"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates scripts emphasizing convenience and reliability vs cheaper slow competitors</p>
                  </div>

                  <div>
                    <strong>Script Set 3 - EXPERTISE ADVANTAGE:</strong>
                    <p className="text-sm ml-4 text-slate-600">Your Advantage: "Master-certified technicians, 20 years experience, fix-it-right guarantee"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI creates scripts emphasizing superior diagnostic capability and avoiding repeat failures</p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-semibold text-yellow-900">
                  💡 Test different competitive advantages to see which resonates best with your market!
                </p>
              </div>
            </details>

            {/* FORM */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Business Type *</label>
                  <select id="oh_business_type" className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900">
                    <option value="">-- Select Your Trade --</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Target Market *</label>
                  <select id="oh_target_market" className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900">
                    <option value="">-- Select Your Market --</option>
                    {targetMarkets.map(market => (
                      <option key={market} value={market}>{market}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Common Objection *</label>
                <select id="oh_objection" className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900">
                  <option value="">-- Select Objection --</option>
                  <optgroup label="💰 PRE-SALE: Price Objections">
                    <option value="You're too expensive / Your price is too high">You're too expensive / Your price is too high</option>
                    <option value="Why does it cost so much?">Why does it cost so much?</option>
                    <option value="Can you match this other quote?">Can you match this other quote?</option>
                    <option value="I don't have the budget right now">I don't have the budget right now</option>
                  </optgroup>
                  <optgroup label="⏳ PRE-SALE: Timing Objections">
                    <option value="I need to get 3 quotes first">I need to get 3 quotes first</option>
                    <option value="I want to think about it">I want to think about it</option>
                    <option value="I need to talk to my spouse/partner first">I need to talk to my spouse/partner first</option>
                    <option value="I'm not ready right now / Maybe next month">I'm not ready right now / Maybe next month</option>
                  </optgroup>
                  <optgroup label="🛠️ PRE-SALE: Trust Objections">
                    <option value="I can do it myself / I'll just DIY">I can do it myself / I'll just DIY</option>
                    <option value="I've had bad experiences with contractors before">I've had bad experiences with contractors before</option>
                  </optgroup>
                  <optgroup label="⭐ POST-SERVICE: Service Recovery (1-8 Ratings)">
                    <option value="POST-SERVICE: Customer gave a low rating (1-8)">Customer gave a low rating (1-8) on satisfaction survey</option>
                    <option value="POST-SERVICE: Customer is unhappy with the final result">Customer is unhappy with the final result</option>
                    <option value="POST-SERVICE: Customer complained about response time or communication">Customer complained about response time or communication</option>
                    <option value="POST-SERVICE: Customer feels they were overcharged">Customer feels they were overcharged after the job</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Your Competitive Advantage (Optional but Powerful)</label>
                <textarea
                  id="oh_advantage"
                  rows="2"
                  placeholder="e.g., 'Lifetime warranty on parts + 5-year labor' or 'Same-day service, 2-hour response' or 'Master-certified, 20 years experience'"
                  className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
                <p className="text-amber-800 text-sm"><strong>⏱️ Heads Up:</strong> Scripts take <strong>20-30 seconds</strong> to generate. You'll get a phone script, email/text template, in-person script, and quick comebacks.</p>
              </div>

              <button
                type="button"
                onClick={generateObjectionHandler}
                disabled={loading}
                className="btn w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💬 Generate Objection Scripts
              </button>
            </div>

            {loading && (
              <div className="text-center py-10">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-slate-600">AI is building your custom objection scripts...</p>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-500 text-red-900 p-4 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

            {output && (
              <>
                <div className="mt-6 bg-white border-2 border-blue-500 rounded-xl p-6 output-box" style={{boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)"}}>
                  {formatOutput(output)}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${copySuccess ? "bg-green-700" : "bg-green-600"} text-white`}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy to Clipboard"}
                  </button>
                  <button
                    onClick={saveToLibrary}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${saveSuccess ? "bg-purple-700" : "bg-purple-600"} text-white`}
                  >
                    {saveSuccess ? "✅ Saved!" : "💾 Save to Library"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* SEASONAL CAMPAIGN BUILDER MODAL */}
      {activeModal === 'seasonalCampaign' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-4xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">🎯 Seasonal Campaign Builder</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* WHAT IS THIS */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">🎯 What Does This Tool Do?</h3>
              <p className="text-blue-900 leading-relaxed mb-3">
                Creates a <strong>complete multi-channel campaign</strong> in ONE click with 6 ready-to-use pieces:
                (1) 3-email sequence, (2) 4 social media posts, (3) Google Business post, (4) Flyer copy, (5) 3 text blasts, and (6) Execution checklist.
              </p>
              <p className="text-blue-900 leading-relaxed">
                <strong>Why use it?</strong> Drives bookings during seasonal peaks. Saves hours of planning and coordination.
                Launch coordinated campaigns across ALL channels instantly - no more scrambling to create content!
              </p>
            </div>

            {/* HOW TO USE */}
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border-2 border-slate-300">
              <h3 className="text-slate-900 font-bold text-xl mb-4">📋 How to Execute Your Campaign</h3>

              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500 mb-4">
                <p className="text-orange-900 text-sm font-bold">⚡ Your Roadmap says SATURDAY = Deep-Dive Day. Build your seasonal campaigns on Saturday, then spend 30 minutes scheduling everything for the weeks ahead. One Saturday of work = a full month of coordinated marketing across every channel.</p>
              </div>

              <div className="space-y-3 text-slate-700">
                <div>
                  <strong className="text-blue-600">Piece 1 (Emails):</strong> Copy into Mailchimp, Constant Contact, or even Gmail drafts. Schedule sends using the timing built into each email.
                </div>
                <div>
                  <strong className="text-blue-600">Piece 2 (Social Posts):</strong> Pre-schedule on Facebook, Nextdoor, or use Buffer/Hootsuite. Posts are platform-specific — don't cross-post the same content.
                </div>
                <div>
                  <strong className="text-blue-600">Piece 3 (Google Business):</strong> Log into business.google.com → Posts → paste directly. Remember: plain text only.
                </div>
                <div>
                  <strong className="text-blue-600">Piece 4 (Flyer):</strong> Paste copy into Canva (free) or give to your designer. Design notes included.
                </div>
                <div>
                  <strong className="text-blue-600">Piece 5 (Text Blasts):</strong> Use your text blast service or manual texts. Character counts included.
                </div>
                <div>
                  <strong className="text-blue-600">Piece 6 (Checklist):</strong> Print the execution timeline and check off each task as you go.
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-900 text-sm">
                  <strong>💡 Pro Tip:</strong> Run seasonal campaigns quarterly (spring, summer, fall, winter).
                  This tool makes it easy to launch 4 major campaigns per year that drive massive booking spikes.
                </p>
              </div>

              <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-900 text-sm">
                  <strong>🔧 TOOL SYNC:</strong> Feed campaign themes into <strong>💡 Daily Tip Generator</strong> for supporting posts between emails. Use <strong>🌦️ Weather Alert</strong> for weather-triggered urgency messages. Run <strong>📝 Google Business Post Optimizer</strong> for extra GBP posts during your campaign window.
                </p>
              </div>
            </div>

            {/* PRO TIPS */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl mb-6 border-2 border-yellow-400">
              <summary className="font-bold text-lg text-yellow-900 cursor-pointer mb-3">💡 PRO TIPS: Getting Fresh Campaigns (Click to Expand)</summary>
              <div className="mt-3 text-slate-700">
                <p className="mb-3 font-semibold">Same season, different campaign angles:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div>
                    <strong className="text-yellow-700">🔄 Example: Spring HVAC Campaigns</strong>
                  </div>

                  <div>
                    <strong>Campaign 1 - MAINTENANCE FOCUS:</strong>
                    <p className="text-sm ml-4 text-slate-600">Campaign: "Pre-summer AC tune-up special"</p>
                    <p className="text-sm ml-4 text-slate-600">Offer: "$89 tune-up prevents $2,500 emergency repairs"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI emphasizes preventive value and avoiding summer breakdowns</p>
                  </div>

                  <div>
                    <strong>Campaign 2 - UPGRADE FOCUS:</strong>
                    <p className="text-sm ml-4 text-slate-600">Campaign: "Spring AC replacement special"</p>
                    <p className="text-sm ml-4 text-slate-600">Offer: "$1,500 rebate on new high-efficiency systems"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI emphasizes energy savings and avoiding summer price surge</p>
                  </div>

                  <div>
                    <strong>Campaign 3 - URGENCY FOCUS:</strong>
                    <p className="text-sm ml-4 text-slate-600">Campaign: "Beat the rush - book now before heat wave"</p>
                    <p className="text-sm ml-4 text-slate-600">Offer: "Priority scheduling + $50 off for early birds"</p>
                    <p className="text-xs ml-4 text-slate-500 italic">→ AI emphasizes scarcity and avoiding summer wait times</p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-semibold text-yellow-900">
                  💡 Same season, completely different messaging! Change campaign focus and offer to test different angles.
                </p>
              </div>
            </details>

            {/* FORM */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Business Type *</label>
                  <select id="sc_business_type" className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900">
                    <option value="">-- Select Your Trade --</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Target Market *</label>
                  <select id="sc_target_market" className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900">
                    <option value="">-- Select Your Market --</option>
                    {targetMarkets.map(market => (
                      <option key={market} value={market}>{market}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Season/Timing *</label>
                  <select id="sc_season" className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900">
                    <option value="">-- Select Season --</option>
                    <option value="Spring (March-May)">Spring (March-May)</option>
                    <option value="Summer (June-August)">Summer (June-August)</option>
                    <option value="Fall (September-November)">Fall (September-November)</option>
                    <option value="Winter (December-February)">Winter (December-February)</option>
                    <option value="Holiday Season">Holiday Season</option>
                    <option value="Back to School">Back to School</option>
                    <option value="Tax Refund Season">Tax Refund Season</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Your City/Area *</label>
                  <input
                    type="text"
                    id="sc_city"
                    placeholder="Harrisburg, Camp Hill, etc."
                    className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Campaign Focus *</label>
                <input
                  type="text"
                  id="sc_campaign"
                  placeholder="e.g., 'Spring AC tune-up special' or 'Pre-winter furnace inspection' or 'Summer deck building promotion'"
                  className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Offer Details (Optional but Recommended)</label>
                <textarea
                  id="sc_offer"
                  rows="3"
                  placeholder="e.g., '$89 tune-up (reg $149), includes filter replacement' or '20% off new installs booked by April 30' or 'Free inspection + priority scheduling'"
                  className="w-full p-3 border-2 border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
                <p className="text-amber-800 text-sm"><strong>⏱️ Heads Up:</strong> This generates a <strong>complete 6-piece campaign</strong> (emails, social posts, Google Business, flyer, text blasts, checklist). Please allow <strong>60-90 seconds</strong> — do not navigate away or press the button again.</p>
              </div>

              <button
                type="button"
                onClick={generateSeasonalCampaign}
                disabled={loading}
                className="btn w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎯 Generate Complete Campaign
              </button>
            </div>

            {loading && (
              <div className="text-center py-10">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-slate-600">AI is building your complete 6-piece multi-channel campaign... this is the big one!</p>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-500 text-red-900 p-4 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

            {output && (
              <>
                <div className="mt-6 bg-white border-2 border-blue-500 rounded-xl p-6 output-box" style={{boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)"}}>
                  {formatOutput(output)}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${copySuccess ? "bg-green-700" : "bg-green-600"} text-white`}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy to Clipboard"}
                  </button>
                  <button
                    onClick={saveToLibrary}
                    className={`btn flex-1 py-3 px-6 rounded-xl font-bold ${saveSuccess ? "bg-purple-700" : "bg-purple-600"} text-white`}
                  >
                    {saveSuccess ? "✅ Saved!" : "💾 Save to Library"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* GETTING STARTED MODAL */}
      {activeModal === 'gettingStarted' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-5xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">🎓 GETTING STARTED — SETUP GUIDE</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-6 rounded-xl mb-6 border-2 border-orange-500">
              <h3 className="text-orange-900 font-bold text-2xl mb-2">🏗️ The "Digital Foundation" Roadmap</h3>

              <div className="bg-white/70 p-4 rounded-lg mb-4">
                <p className="text-orange-900 text-lg italic">
                  "In the home services industry, your reputation is built on the job site, but your <strong>revenue is built on the internet.</strong> Day 1 and Day 2 are designed to take you from 'invisible' to 'dominant' in your local market."
                </p>
              </div>

              <h4 className="text-orange-900 font-bold text-lg mb-3">📦 What's Inside:</h4>

              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-bold text-lg mb-2 text-blue-700">📅 DAY 1: The Digital Fortress <span className="text-slate-500 font-normal">(1h 40min)</span></p>
                  <p className="text-slate-700">
                    Claiming your name on the <strong>Big 4 platforms</strong> (Google, Facebook, Nextdoor, Yelp) so you own your local real estate.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="font-bold text-lg mb-2 text-purple-700">📅 DAY 2: The Multiplier <span className="text-slate-500 font-normal">(1h 45min)</span></p>
                  <p className="text-slate-700">
                    Deep optimization tricks (<strong>Geotagging, Q&A seeding, and Tracking</strong>) that make the algorithms favor you over the guy who has been in business for 20 years.
                  </p>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="font-semibold text-orange-900">⏱️ Total Time: 3 hours 25 minutes for complete setup</p>
                  <p className="text-sm mt-1 text-orange-800">💡 Power User Option: Do both days in one sitting to get fully optimized immediately!</p>
                  <p className="text-sm mt-1 text-orange-800">🎯 Recommended: Day 1 today, Day 2 tomorrow (or within 48 hours)</p>
                </div>
              </div>
            </div>

            {/* DAY 1: THE DIGITAL FORTRESS */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-blue-600">📅 DAY 1: THE DIGITAL FORTRESS (1h 40min)</h3>
              <p className="text-slate-700 mb-4 italic font-semibold">"Today, we claim your digital real estate. These 4 platforms drive 90% of local leads. Consistency is king: if your info doesn't match across all four, Google will hide you."</p>

              {/* NAP Warning */}
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 mb-6">
                <h4 className="font-bold text-lg text-red-800 mb-3">🛑 STOP: The "Golden Rule" of NAP</h4>
                <p className="text-slate-700 mb-3">Before touching a single platform, write down your <strong>N.A.P. (Name, Address, Phone)</strong> in a note on your phone.</p>
                <div className="bg-white p-3 rounded-lg border-l-4 border-red-500">
                  <p className="text-red-900 font-semibold">⚠️ Consistency Check:</p>
                  <p className="text-slate-700 text-sm mt-1">If your utility bill says "[Your Company Name], LLC" and "123 Main St.", use <strong>exactly that</strong>. Do not use "[Your Company]" on one platform and "[Your Company] LLC" on another.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-5">
                  <div className="space-y-6 text-slate-700">
                    {/* Platform 1: GBP */}
                    <div>
                      <strong className="text-green-700 text-lg">1. Google Business Profile (GBP) | 35 min</strong>
                      <p className="text-sm text-green-800 italic ml-5">The King of Local Search.</p>
                      <ol className="text-sm ml-9 mt-2 space-y-2 list-decimal">
                        <li><strong>Step 1:</strong> Go to <code className="bg-slate-200 px-1 rounded">business.google.com</code></li>
                        <li><strong>Step 2:</strong> Search for your name. If it exists, click "Claim this business." If not, "Add your business."</li>
                        <li><strong>Step 3: Verification (The Reality):</strong>
                          <ul className="ml-4 mt-1 space-y-1 list-disc">
                            <li>Google likely will require <strong>Video Verification</strong>. You will need to film a 1-2 minute video showing:</li>
                            <ol className="ml-6 mt-1 space-y-1 list-decimal">
                              <li>Your street sign/neighborhood.</li>
                              <li>Your branded truck or tools.</li>
                              <li>Your business license or a utility bill with your name.</li>
                            </ol>
                          </ul>
                          <div className="bg-red-50 p-2 rounded mt-2 border-l-4 border-red-500">
                            <p className="text-red-800 text-xs"><strong>⚠️ CRITICAL PRO-TIP:</strong> Google is failing ~50% of video verifications on the first try. Start the video OUTSIDE showing your street sign, then pan to your truck, then walk inside and <strong>unlock the door with your key</strong> or show your business license. Google's AI is looking for "Access and Authority." If you don't show the key/license, you will fail.</p>
                            <p className="text-red-800 text-xs mt-2"><strong>🔧 Trade-Specific Tip:</strong> If you are a Roofer, show your ladder rack and shingles; if HVAC, show a furnace manifold or your manifold gauges; if Electrician, show your panel tools and meter. Google's AI is looking for trade-specific "Heavy Equipment" to prove you aren't a lead-gen bot.</p>
                          </div>
                        </li>
                        <li><strong>Step 4: The 100% Rule:</strong> Fill in every field. For the Description (750 chars), mention your city and main services in the first two sentences.
                          <div className="bg-purple-50 p-2 rounded mt-1 border-l-4 border-purple-500">
                            <p className="text-purple-800 text-xs"><strong>🤖 AI Tip:</strong> Include one "Natural Language" sentence like: <em>"Neighbors often ask us how to handle [Service] after a [Local Weather Event]."</em> This helps Google's Gemini AI recommend you for conversational searches.</p>
                          </div>
                        </li>
                        <li><strong>Step 5: Turn on Messages:</strong> This is the "Lead Magnet." If you don't turn this on, you're invisible to mobile users.</li>
                      </ol>
                    </div>

                    {/* Platform 2: Facebook */}
                    <div>
                      <strong className="text-green-700 text-lg">2. Facebook (Meta) Business Page | 20 min</strong>
                      <p className="text-sm text-green-800 italic ml-5">The Community Trust Builder.</p>
                      <ol className="text-sm ml-9 mt-2 space-y-2 list-decimal">
                        <li><strong>Step 1:</strong> Go to <a href="https://facebook.com/pages/create" target="_blank" className="text-blue-600 underline font-bold">facebook.com/pages/create</a>. Choose Professional Service.</li>
                        <li><strong>Step 2:</strong> Use your <strong>Logo</strong> as the Profile Picture and a <strong>Photo of your Team/Truck</strong> as the Cover Photo.</li>
                        <li><strong>Step 3: The Action Button:</strong> Set this to "WhatsApp" or "Call Now." (Homeowners in an emergency don't want to "Email" you).</li>
                        <li><strong>Step 4: Link to WhatsApp:</strong> Connect your <a href="https://whatsapp.com/business" target="_blank" className="text-blue-600 underline font-bold">WhatsApp Business</a> number immediately. This creates a "verified" feel for the Facebook (Meta) algorithm. <strong className="text-red-600">Don't just link WhatsApp — start a "VIP Channel."</strong> This is your private broadcast loop that bypasses all social media algorithms. One monthly maintenance tip sent to your channel gets 98% open rates (vs. 2% on Facebook). Use the <strong>🚀 Unfair Advantage Guide</strong> instructions to set this up.</li>
                        <li><strong>Step 5 (Essential):</strong> Consider <a href="https://about.meta.com/technologies/meta-verified/" target="_blank" className="text-blue-600 underline font-bold">Facebook Verified (Meta)</a> ($15/mo) for the blue checkmark. Homeowners in emergencies trust verified pages 3x more.</li>
                      </ol>
                    </div>

                    {/* Platform 3: Nextdoor */}
                    <div>
                      <strong className="text-green-700 text-lg">3. Nextdoor Business | 20 min</strong>
                      <p className="text-sm text-green-800 italic ml-5">The Neighborhood Word-of-Mouth Machine.</p>
                      <ol className="text-sm ml-9 mt-2 space-y-2 list-decimal">
                        <li><strong>Step 1:</strong> Go to <code className="bg-slate-200 px-1 rounded">nextdoor.com/business</code></li>
                        <li><strong>Step 2:</strong> Search for your business. <strong className="text-red-600">Crucial:</strong> Neighbors often "create" your page by recommending you. If you see yourself, Claim it instead of creating a duplicate.</li>
                        <li><strong>Step 3: Category Selection:</strong> Be specific (e.g., "Plumber," "Electrician," or "Roofing").</li>
                        <li><strong>Step 4: First Post:</strong> Post a "Hello Neighborhood" update. Use a photo of yourself in front of your truck. Say: <em>"I live here in [City] and I'm here to help. Reach out for a free inspection."</em></li>
                      </ol>
                    </div>

                    {/* Platform 4: Yelp & Apple */}
                    <div>
                      <strong className="text-green-700 text-lg">4. Yelp & Apple Maps (The "Siri" Shield) | 25 min</strong>
                      <p className="text-sm text-green-800 italic ml-5">If you aren't on Yelp, you don't exist on iPhones.</p>
                      <ol className="text-sm ml-9 mt-2 space-y-2 list-decimal">
                        <li><strong>Step 1:</strong> Go to <a href="https://biz.yelp.com" target="_blank" className="text-blue-600 underline font-bold">biz.yelp.com</a>. Claim your business.</li>
                        <li><strong>Step 2: The Apple Sync:</strong> Yelp data powers Apple Maps. Once your Yelp is verified, your business will automatically show up on iPhones and Siri searches within 48-72 hours.</li>
                        <li><strong>Step 2.5 (MANDATORY):</strong> Claim <a href="https://businessconnect.apple.com" target="_blank" className="text-blue-600 underline font-bold">Apple Business Connect</a>. <strong className="text-red-600">This is no longer optional.</strong> This is where you post "Showcases" that appear on the dashboard of every CarPlay-enabled vehicle in your zip code. This is the direct "Master Key" to Siri — Yelp feeds Apple Maps data, but Apple Business Connect gives you <strong>full control</strong> over how you appear in Apple Maps, Siri, and Wallet.</li>
                        <li><strong>Step 3: The "No Ads" Defense:</strong> Yelp will call you to sell ads. <strong className="text-red-600">Do not buy them.</strong> Simply say: <em>"I am only using the free profile to manage my Apple Maps presence right now."</em></li>
                        <li><strong>Step 4: Upload 5 Photos:</strong> Profiles with 5+ photos get 2x more clicks on Apple Maps.</li>
                      </ol>
                    </div>
                  </div>

                  {/* PRO-TIP: One-Tap Call Hack */}
                  <div className="mt-6 bg-gradient-to-r from-purple-100 to-indigo-100 p-5 rounded-xl border-2 border-purple-500">
                    <h4 className="font-bold text-lg text-purple-900 mb-3">⚡ PRO-TIP: The "One-Tap" Call Hack</h4>

                    <div className="bg-white p-4 rounded-lg mb-4">
                      <p className="text-slate-700 mb-3">
                        <strong className="text-purple-700">The Strategy:</strong> On both Yelp and Google, you will set up an "Auto-Reply" or "Welcome Message." Most businesses just say <em>"Thanks for reaching out, we'll get back to you soon."</em> <strong className="text-red-600">Don't do that.</strong>
                      </p>

                      <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-500">
                        <p className="text-purple-900 font-bold mb-2">🎯 The Hack - Use this exact phrasing:</p>
                        <p className="text-purple-800 italic">"Thanks for reaching out! For faster service and 24/7 emergency dispatch, please call us directly at <strong>(555) 555-5555</strong>."</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-slate-700 mb-3">
                        <strong className="text-blue-700">💡 Why It Works:</strong> Smartphone OS updates (iOS/Android) automatically detect the <code className="bg-slate-200 px-2 py-1 rounded">(XXX) XXX-XXXX</code> format and turn it into a <strong>clickable link</strong> inside the chat window.
                      </p>

                      <div className="space-y-2 mt-3">
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✅</span>
                          <p className="text-slate-700 text-sm"><strong>The Result:</strong> The customer doesn't have to "copy-paste" or remember your number. They tap the text, and their phone starts dialing.</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">🏆</span>
                          <p className="text-slate-700 text-sm"><strong>The Win:</strong> This 2-second shortcut is often the only reason a homeowner chooses you over the competitor who told them to "Visit our website for a quote."</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded mt-3 border-l-4 border-blue-500">
                        <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Use the <strong>💬 Objection Handler Scripts</strong> — type "How much do you cost?" as the objection. Use the <strong>Email/Text Follow-Up</strong> script it generates as your auto-reply template. It doesn't just give a price — it reframes cost as investment before they even call.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-100 rounded-lg border-l-4 border-green-600">
                    <p className="text-green-900 font-bold text-lg">✅ DAY 1 COMPLETE</p>
                    <p className="text-green-800 mt-2">You are now "Live" in the eyes of the internet.</p>
                    <p className="text-orange-700 font-bold mt-2">⚠️ CRITICAL: Tomorrow (Day 2: THE MULTIPLIER), we go from "live" to "dominant." We'll geotag photos, set up keyword alerts, and turn you into the first responder in your zip codes.</p>
                  </div>
                </div>

                                {/* DAY 2: THE MULTIPLIER */}
                <div className="mt-8 mb-8">
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border-4 border-purple-600 rounded-xl p-6 mb-4">
                    <h3 className="text-2xl font-bold mb-4 text-purple-900">📅 DAY 2: THE MULTIPLIER (1h 45min)</h3>
                    <div className="bg-white p-4 rounded-lg mb-4">
                      <p className="text-purple-900 font-bold text-xl mb-2">"Yesterday you got live. Today, we make you dominant."</p>
                      <p className="text-slate-700 mb-3">
                        95% of your competitors stop at Day 1. By finishing Day 2, you are telling the algorithms that you are <strong>the most trusted pro in your zip code.</strong>
                      </p>
                    </div>
                  </div>

                  {/* STEP 1: GBP Deep-Dive */}
                  <details className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl mb-4 border-2 border-red-500" open>
                    <summary className="font-bold text-xl text-red-900 cursor-pointer mb-3 hover:text-red-700">
                      📍 STEP 1: Google Business Profile Deep-Dive | 40 min <span className="text-sm font-normal italic">(Click to expand)</span>
                    </summary>

                    <div className="mt-4 space-y-4 text-slate-800">
                      <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                        <p className="font-bold text-red-800 text-lg">🎯 The Goal: Show up in "Near Me" searches across your entire county.</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg space-y-5">
                        {/* Geo-Mapping Hack */}
                        <div className="border-b border-slate-200 pb-4">
                          <strong className="text-red-700 text-lg">🗺️ The Geo-Mapping Hack</strong>
                          <p className="mt-2 text-slate-700">Go to <strong>Service Areas</strong>. Do NOT just put your city.</p>
                          <div className="bg-yellow-50 p-3 rounded mt-2 border-l-4 border-yellow-500">
                            <p className="font-bold text-yellow-800">Action: List the top 20 zip codes where the "money" is.</p>
                            <ul className="ml-4 mt-2 text-sm space-y-1">
                              <li>• Target affluent neighborhoods</li>
                              <li>• Include areas with older homes (more repairs needed)</li>
                              <li>• Cover the full radius you're willing to travel</li>
                            </ul>
                          </div>
                          <div className="bg-purple-50 p-3 rounded mt-3 border-l-4 border-purple-500">
                            <p className="text-purple-900 font-bold text-sm">🔮 Secret:</p>
                            <p className="text-purple-800 text-sm mt-1">Google now prioritizes businesses that list <strong>specific zip codes</strong> over broad city names because it shows hyper-local expertise.</p>
                          </div>
                        </div>

                        {/* Geotagging 2.0 */}
                        <div className="border-b border-slate-200 pb-4">
                          <strong className="text-red-700 text-lg">📸 Geotagging 2.0 (The "Proof of Work")</strong>
                          <div className="bg-blue-50 p-3 rounded mt-2 border-l-4 border-blue-500">
                            <p className="text-blue-900 font-bold text-sm">🤖 Key Insight: Google's AI now "looks" INSIDE your photos!</p>
                          </div>
                          <div className="bg-white p-3 rounded mt-3 border border-slate-300">
                            <p className="font-bold text-slate-800">How to do it:</p>
                            <ol className="ml-4 mt-2 text-sm space-y-2 list-decimal">
                              <li>Go to <a href="https://geoimgr.com" target="_blank" className="text-blue-600 underline font-bold">GeoImgr.com</a></li>
                              <li>Upload 5 photos of your truck or equipment</li>
                              <li>"Pin" them to the center of your <strong>3 biggest target cities</strong></li>
                              <li>Re-download the geotagged photos</li>
                              <li>Upload to GBP</li>
                            </ol>
                          </div>
                          <div className="bg-green-50 p-3 rounded mt-3 border-l-4 border-green-500">
                            <p className="text-green-800 font-bold">✅ The Win:</p>
                            <p className="text-green-700 text-sm mt-1">It tells Google: <em>"I am physically present in these high-value areas."</em></p>
                          </div>
                          <div className="bg-yellow-50 p-3 rounded mt-3 border-l-4 border-yellow-600">
                            <p className="text-yellow-800 text-sm"><strong>📝 Note:</strong> Only use GeoImgr for your <strong>"Truck"</strong> and <strong>"Team"</strong> photos. For actual job site photos, your smartphone's GPS handles this automatically—just make sure <strong>Location Services is ON!</strong></p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded mt-3 border-l-4 border-purple-500">
                            <p className="text-purple-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Before you geotag, run your job description through the <strong>📸 Before/After Story Generator</strong>. It generates <strong>SEO alt-text and captions</strong> that tell Google's AI exactly what your photo shows — turning it into a "Quality Service Signal."</p>
                          </div>
                        </div>

                        {/* Seed Your Q&A */}
                        <div>
                          <strong className="text-red-700 text-lg">❓ Seed Your Q&A (The SEO Goldmine)</strong>
                          <p className="mt-2 text-slate-700 font-semibold">YOU ask the question, YOU provide the answer.</p>

                          <div className="bg-slate-50 p-4 rounded mt-3 border border-slate-300">
                            <p className="font-bold text-slate-800 mb-2">Examples (adapt for YOUR trade):</p>
                            <div className="space-y-3">
                              <div className="bg-blue-50 p-2 rounded">
                                <p className="text-sm"><strong className="text-blue-700">Q:</strong> "Do you offer emergency [your service] in [City Name]?"</p>
                                <p className="text-sm"><strong className="text-green-700">A:</strong> "Yes! We offer 24/7 emergency service in [City Name] and [Neighborhoods]. We usually arrive in under 60 minutes."</p>
                              </div>
                              <div className="bg-purple-50 p-2 rounded">
                                <p className="text-xs text-slate-600 font-bold mb-1">Trade-Specific Examples:</p>
                                <p className="text-xs text-slate-600">🔧 <strong>Plumber:</strong> "What causes low water pressure in [City] homes?"</p>
                                <p className="text-xs text-slate-600">🔌 <strong>Electrician:</strong> "How much does a panel upgrade cost in [City]?"</p>
                                <p className="text-xs text-slate-600">❄️ <strong>HVAC:</strong> "When should I replace my AC unit in [City]?"</p>
                                <p className="text-xs text-slate-600">🏠 <strong>Roofer:</strong> "How do I know if I need a roof replacement in [City]?"</p>
                                <p className="text-xs text-slate-600">🪲 <strong>Pest Control:</strong> "What are signs of termites in [City] homes?"</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-yellow-50 p-3 rounded mt-3 border-l-4 border-yellow-500">
                            <p className="text-yellow-800 font-bold">💡 Why This Works:</p>
                            <p className="text-yellow-700 text-sm mt-1">Google indexes these Q&As. This acts like <strong>"Hidden SEO"</strong> for your profile that competitors don't know about!</p>
                          </div>

                          <div className="bg-purple-50 p-3 rounded mt-3 border-l-4 border-purple-500">
                            <p className="text-purple-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Use the <strong>❓ FAQ/Website Content Generator</strong> to generate 5 "Strategic Questions." These are the exact questions neighbors are asking ChatGPT and Gemini. Seed these into your GBP for maximum AEO (Answer Engine Optimization).</p>
                          </div>
                        </div>

                        {/* Step 1.5: The AI Sync */}
                        <div className="border-t-2 border-dashed border-indigo-300 pt-4">
                          <strong className="text-indigo-700 text-lg">🤖 Step 1.5: The AI Sync (Bing Places)</strong>
                          <p className="mt-2 text-slate-700">Go to <a href="https://www.bingplaces.com" target="_blank" className="text-blue-600 underline font-bold">Bing Places for Business</a> and click <strong>"Import from Google."</strong></p>
                          <div className="bg-indigo-50 p-3 rounded mt-2 border-l-4 border-indigo-500">
                            <p className="text-indigo-800 text-sm font-bold">💡 Why This Matters:</p>
                            <p className="text-indigo-700 text-sm mt-1">This is how you tell <strong>ChatGPT, Gemini, and Perplexity</strong> that you are the verified expert. If you aren't on Bing, the AI won't cite you. It takes 30 seconds — Bing auto-imports everything from your GBP.</p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded mt-2 border-l-4 border-purple-500">
                            <p className="text-purple-800 text-sm"><strong>🔧 TOOL SYNC:</strong> See the <strong>🚀 Unfair Advantage Guide → Platform #2: Answer Engine Optimization</strong> for the full AI Citation strategy.</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-red-100 rounded-lg border-l-4 border-red-600">
                        <p className="text-red-900 font-semibold">
                          📈 Impact: GBP drives 70% of local leads. These 4 optimizations put you ahead of 95% of competitors!
                        </p>
                      </div>
                    </div>
                  </details>

                  {/* STEP 2: Facebook Lead Sniper */}
                  <details className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-blue-500">
                    <summary className="font-bold text-xl text-blue-900 cursor-pointer mb-3 hover:text-blue-700">
                      📘 STEP 2: Facebook (Meta) "Lead Sniper" Setup | 25 min <span className="text-sm font-normal italic">(Click to expand)</span>
                    </summary>

                    <div className="mt-4 space-y-4 text-slate-800">
                      <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="font-bold text-blue-800 text-lg">🎯 The Goal: Turn your page into a trust-building machine.</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg space-y-5">
                        {/* Vanity URL */}
                        <div className="border-b border-slate-200 pb-4">
                          <strong className="text-blue-700 text-lg">🔗 Claim Your Vanity URL</strong>
                          <div className="bg-slate-50 p-3 rounded mt-2">
                            <p className="text-sm"><strong>Go to:</strong> Settings → Username</p>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-red-600">❌ Before: <code className="bg-red-50 px-2 py-1 rounded">facebook.com/acclaim-12345</code></p>
                              <p className="text-sm text-green-600">✅ After: <code className="bg-green-50 px-2 py-1 rounded">facebook.com/YourCompanyName[City]</code></p>
                            </div>
                            <p className="text-xs text-slate-600 mt-2">It looks better on a business card AND helps search ranking!</p>
                          </div>
                        </div>

                        {/* Blue Badge */}
                        <div className="border-b border-slate-200 pb-4">
                          <strong className="text-blue-700 text-lg">✓ The "Blue Badge" Move (Facebook Verified (Meta))</strong>
                          <div className="bg-blue-50 p-3 rounded mt-2 border-l-4 border-blue-600">
                            <p className="text-blue-900 font-bold text-sm">🔮 Facebook Verified (Meta) is now a "pay-to-play" trust signal. Homeowners in an emergency trust a blue checkmark 3x more than an unverified page.</p>
                          </div>
                          <div className="bg-white p-3 rounded mt-2 border border-slate-300">
                            <p className="font-bold text-slate-800 text-sm mb-2">📋 How to Get Facebook Verified (Meta):</p>
                            <ol className="ml-4 text-sm space-y-2 list-decimal">
                              <li>Go to your Facebook Business Page</li>
                              <li>Click <strong>Settings</strong> (gear icon) → <strong>Facebook Verified (Meta)</strong></li>
                              <li>If you don't see it there, go directly to <a href="https://about.meta.com/technologies/meta-verified/" target="_blank" className="text-blue-600 underline font-bold">meta.com/meta-verified</a></li>
                              <li>Choose the <strong>Business plan</strong> (~$15/mo)</li>
                              <li>Upload a <strong>government-issued ID</strong> or <strong>business license</strong> for verification</li>
                              <li>Once approved (usually 24-48 hours), you get the <strong>blue checkmark</strong> on both Facebook and Instagram</li>
                            </ol>
                          </div>
                          <div className="bg-green-50 p-2 rounded mt-2 border-l-4 border-green-500">
                            <p className="text-green-800 text-xs"><strong>💡 Why It's Worth $15/mo:</strong> The blue badge unlocks better reach in the algorithm, impersonation protection, and priority customer support. For a business owner, it pays for itself with a single lead.</p>
                          </div>
                        </div>

                        {/* Neighborhood Group Strategy */}
                        <div>
                          <strong className="text-blue-700 text-lg">🏘️ The Neighborhood Group Strategy</strong>
                          <div className="bg-purple-50 p-4 rounded mt-3 border-2 border-purple-400">
                            <p className="font-bold text-purple-900 mb-2">Action Plan:</p>
                            <ol className="ml-4 text-sm space-y-2 list-decimal">
                              <li><strong>Join 5 "Community" or "Neighbors of..." groups</strong> in your service area</li>
                              <li>In your settings, turn on <strong>"All Posts"</strong> notifications for each group</li>
                              <li>Monitor for recommendation requests</li>
                            </ol>
                          </div>

                          <div className="bg-green-50 p-4 rounded mt-3 border-l-4 border-green-500">
                            <p className="font-bold text-green-800 mb-2">🎯 The Routine:</p>
                            <p className="text-green-700 text-sm">When someone asks for a "recommendation," <strong>don't just link your site.</strong></p>
                            <div className="bg-white p-3 rounded mt-2 border border-green-300">
                              <p className="text-sm italic text-green-900">"I'm a neighbor over on [Your Street], we handle this all the time. DM me and I'll give you a quick estimate."</p>
                            </div>
                            <p className="text-xs text-green-700 mt-2 font-bold">Why it works: You're a trusted neighbor, not a random business!</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-100 rounded-lg border-l-4 border-blue-600">
                        <p className="text-blue-900 font-semibold">
                          📈 Impact: Vanity URL + Blue Badge + Group Strategy = Trust machine that converts strangers into customers!
                        </p>
                      </div>
                    </div>
                  </details>

                  {/* STEP 3: Nextdoor Neighborhood Leader */}
                  <details className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-4 border-2 border-green-500">
                    <summary className="font-bold text-xl text-green-900 cursor-pointer mb-3 hover:text-green-700">
                      🏘️ STEP 3: Nextdoor "Neighborhood Leader" | 15 min <span className="text-sm font-normal italic">(Click to expand)</span>
                    </summary>

                    <div className="mt-4 space-y-4 text-slate-800">
                      <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                        <p className="font-bold text-green-800 text-lg">🎯 The Goal: Hyper-local dominance.</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg space-y-5">
                        {/* Expand Service Area */}
                        <div className="border-b border-slate-200 pb-4">
                          <strong className="text-green-700 text-lg">📍 Expand Service Area (HUGE!)</strong>
                          <div className="bg-white p-3 rounded mt-2 border border-slate-300">
                            <p className="font-bold text-slate-800 text-sm mb-2">📋 How to Add Up to 80 Neighborhoods:</p>
                            <ol className="ml-4 text-sm space-y-2 list-decimal">
                              <li>Log into <a href="https://business.nextdoor.com" target="_blank" className="text-blue-600 underline font-bold">business.nextdoor.com</a></li>
                              <li>Click your <strong>Business Profile</strong> → <strong>Edit Business Info</strong></li>
                              <li>Scroll to <strong>"Neighborhoods"</strong> or <strong>"Service Area"</strong></li>
                              <li>Click <strong>"Add neighborhoods"</strong> — you can type zip codes, city names, or neighborhood names</li>
                              <li>Add up to <strong>80 neighborhoods</strong> across your entire service radius</li>
                              <li>Prioritize: wealthiest zip codes first, then fill in surrounding areas</li>
                            </ol>
                          </div>
                          <div className="bg-red-50 p-3 rounded mt-2 border-l-4 border-red-500">
                            <p className="text-red-800 text-sm"><strong>Reality Check:</strong> Most pros only add 1 neighborhood. Adding 80 = <strong>10x your organic reach</strong> overnight. Every post you make will now appear in all 80 neighborhoods.</p>
                          </div>
                          <div className="bg-green-50 p-2 rounded mt-2 border-l-4 border-green-500">
                            <p className="text-green-800 text-xs"><strong>🔧 TOOL SYNC:</strong> Use your <strong>📍 Hyper-Local SEO → Core 10 Zip Code Strategy</strong> to identify which neighborhoods to add first — target the wealthiest 10% of your service area.</p>
                          </div>
                        </div>

                        {/* Keyword Alerts */}
                        <div>
                          <strong className="text-green-700 text-lg">🔔 Keyword Alerts (THE #1 LEAD GEN FEATURE ON NEXTDOOR!)</strong>
                          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded mt-3 border-2 border-red-500">
                            <p className="font-bold text-red-900 mb-3">⚡ Set up alerts for keywords in YOUR trade:</p>
                            <div className="space-y-2 mb-3">
                              <p className="text-xs font-bold text-slate-700">🔧 Universal (ALL Trades):</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="bg-red-200 px-3 py-1 rounded-full text-red-900 text-sm font-bold">recommendation</span>
                                <span className="bg-red-200 px-3 py-1 rounded-full text-red-900 text-sm font-bold">emergency</span>
                                <span className="bg-red-200 px-3 py-1 rounded-full text-red-900 text-sm font-bold">need help</span>
                                <span className="bg-red-200 px-3 py-1 rounded-full text-red-900 text-sm font-bold">looking for</span>
                              </div>
                            </div>
                            <div className="space-y-2 mb-3">
                              <p className="text-xs font-bold text-slate-700">🔌 Electricians:</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="bg-yellow-200 px-3 py-1 rounded-full text-yellow-900 text-xs font-bold">flickering</span>
                                <span className="bg-yellow-200 px-3 py-1 rounded-full text-yellow-900 text-xs font-bold">outlet</span>
                                <span className="bg-yellow-200 px-3 py-1 rounded-full text-yellow-900 text-xs font-bold">breaker</span>
                                <span className="bg-yellow-200 px-3 py-1 rounded-full text-yellow-900 text-xs font-bold">power outage</span>
                                <span className="bg-yellow-200 px-3 py-1 rounded-full text-yellow-900 text-xs font-bold">panel</span>
                              </div>
                            </div>
                            <div className="space-y-2 mb-3">
                              <p className="text-xs font-bold text-slate-700">🔧 Plumbers / Restoration:</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="bg-blue-200 px-3 py-1 rounded-full text-blue-900 text-xs font-bold">leak</span>
                                <span className="bg-blue-200 px-3 py-1 rounded-full text-blue-900 text-xs font-bold">flood</span>
                                <span className="bg-blue-200 px-3 py-1 rounded-full text-blue-900 text-xs font-bold">mold</span>
                                <span className="bg-blue-200 px-3 py-1 rounded-full text-blue-900 text-xs font-bold">clogged</span>
                                <span className="bg-blue-200 px-3 py-1 rounded-full text-blue-900 text-xs font-bold">water heater</span>
                              </div>
                            </div>
                            <div className="space-y-2 mb-3">
                              <p className="text-xs font-bold text-slate-700">❄️ HVAC:</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="bg-cyan-200 px-3 py-1 rounded-full text-cyan-900 text-xs font-bold">AC not working</span>
                                <span className="bg-cyan-200 px-3 py-1 rounded-full text-cyan-900 text-xs font-bold">furnace</span>
                                <span className="bg-cyan-200 px-3 py-1 rounded-full text-cyan-900 text-xs font-bold">no heat</span>
                                <span className="bg-cyan-200 px-3 py-1 rounded-full text-cyan-900 text-xs font-bold">thermostat</span>
                                <span className="bg-cyan-200 px-3 py-1 rounded-full text-cyan-900 text-xs font-bold">humid</span>
                              </div>
                            </div>
                            <div className="space-y-2 mb-3">
                              <p className="text-xs font-bold text-slate-700">🏠 Roofers / Exteriors:</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="bg-orange-200 px-3 py-1 rounded-full text-orange-900 text-xs font-bold">roof</span>
                                <span className="bg-orange-200 px-3 py-1 rounded-full text-orange-900 text-xs font-bold">shingles</span>
                                <span className="bg-orange-200 px-3 py-1 rounded-full text-orange-900 text-xs font-bold">gutter</span>
                                <span className="bg-orange-200 px-3 py-1 rounded-full text-orange-900 text-xs font-bold">storm damage</span>
                                <span className="bg-orange-200 px-3 py-1 rounded-full text-orange-900 text-xs font-bold">siding</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-bold text-slate-700">🪲 Pest Control / Landscaping / General:</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="bg-green-200 px-3 py-1 rounded-full text-green-900 text-xs font-bold">termites</span>
                                <span className="bg-green-200 px-3 py-1 rounded-full text-green-900 text-xs font-bold">tree removal</span>
                                <span className="bg-green-200 px-3 py-1 rounded-full text-green-900 text-xs font-bold">handyman</span>
                                <span className="bg-green-200 px-3 py-1 rounded-full text-green-900 text-xs font-bold">remodel</span>
                                <span className="bg-green-200 px-3 py-1 rounded-full text-green-900 text-xs font-bold">fence</span>
                              </div>
                            </div>
                            <p className="text-xs text-red-700 mt-3 font-bold">💡 Pick the Universal keywords + the ones for YOUR trade. Add 8-12 total.</p>
                          </div>

                          <div className="bg-green-50 p-4 rounded mt-3 border-l-4 border-green-600">
                            <p className="font-bold text-green-800 mb-2">📱 The Result:</p>
                            <p className="text-green-700 text-sm">Your phone will ping <strong>the second</strong> a neighbor mentions those words, allowing you to be the <strong>"First Responder."</strong></p>
                          </div>

                          <div className="bg-purple-50 p-3 rounded mt-3 border-l-4 border-purple-500">
                            <p className="text-purple-800 font-bold text-sm">💡 Pro Tip: First responder wins the job 90% of the time!</p>
                          </div>

                          <div className="bg-blue-50 p-3 rounded mt-3 border-l-4 border-blue-500">
                            <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> When you get a keyword alert during storm season, open the <strong>⚡ Weather Alert Urgency Posts</strong> tool. Enter the weather event and your service type — it generates an authority-driven urgency post that positions you as the go-to local pro. For non-weather alerts, use the <strong>💬 Objection Handler</strong> to craft a response that pivots the conversation to booking.</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-green-100 rounded-lg border-l-4 border-green-600">
                        <p className="text-green-900 font-semibold">
                          📈 Impact: 80 neighborhoods + keyword alerts = proactive lead generation while competitors wait for calls!
                        </p>
                      </div>
                    </div>
                  </details>

                  {/* STEP 4: Yelp & Apple Maps Audit */}
                  <details className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl mb-4 border-2 border-yellow-500">
                    <summary className="font-bold text-xl text-yellow-900 cursor-pointer mb-3 hover:text-yellow-700">
                      ⭐ STEP 4: Yelp & Apple Maps Audit | 15 min <span className="text-sm font-normal italic">(Click to expand)</span>
                    </summary>

                    <div className="mt-4 space-y-4 text-slate-800">
                      <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                        <p className="font-bold text-yellow-800 text-lg">🎯 The Goal: The "Siri" Shield — dominate every iPhone search in your area.</p>
                        <p className="text-slate-700 text-sm mt-1">50% of homeowners use iPhones. When they ask Siri "find a [trade] near me," Siri pulls from <strong>Yelp data + Apple Business Connect.</strong> If you're not optimized on both, you're invisible to half the market.</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg space-y-5">
                        {/* Yelp Audit */}
                        <div className="border-b border-slate-200 pb-4">
                          <strong className="text-yellow-700 text-lg">⭐ Part A: The Yelp Deep-Audit</strong>

                          <div className="bg-white p-3 rounded mt-3 border border-slate-300">
                            <p className="font-bold text-slate-800 text-sm mb-2">📋 Step-by-Step Yelp Optimization:</p>
                            <ol className="ml-4 text-sm space-y-2 list-decimal">
                              <li>Log into <a href="https://biz.yelp.com" target="_blank" className="text-blue-600 underline font-bold">biz.yelp.com</a> → Click <strong>"Business Information"</strong></li>
                              <li><strong>NAP Check:</strong> Confirm your Name, Address, and Phone are <strong>character-for-character identical</strong> to your Google Business Profile. Even "St." vs "Street" causes sync failures.</li>
                              <li><strong>Categories:</strong> Add up to 3 categories. Be specific — "Water Damage Restoration" beats "Contractor." Use your primary service as Category 1.</li>
                              <li><strong>Business Hours:</strong> Set accurate hours. If you offer 24/7 emergency service, check that box — Siri filters for "Open Now."</li>
                              <li><strong>Service Area:</strong> Add every zip code you serve (same ones from your GBP).</li>
                              <li><strong>Specialties:</strong> Write 2-3 sentences about what makes you different. Mention your city name and top services — this text is indexed by Apple Maps search.</li>
                            </ol>
                          </div>

                          <div className="bg-yellow-50 p-3 rounded mt-3 border-l-4 border-yellow-500">
                            <p className="font-bold text-yellow-800 text-sm mb-2">✅ Select ALL Applicable Attributes:</p>
                            <p className="text-yellow-700 text-xs mb-2">Go to <strong>Business Information → Amenities and More.</strong> Check every box that applies:</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-green-100 px-3 py-1 rounded text-green-800 text-xs font-bold">✓ Licensed</span>
                              <span className="bg-green-100 px-3 py-1 rounded text-green-800 text-xs font-bold">✓ Insured</span>
                              <span className="bg-green-100 px-3 py-1 rounded text-green-800 text-xs font-bold">✓ Emergency Services</span>
                              <span className="bg-green-100 px-3 py-1 rounded text-green-800 text-xs font-bold">✓ Free Estimates</span>
                              <span className="bg-green-100 px-3 py-1 rounded text-green-800 text-xs font-bold">✓ Same-Day Service</span>
                              <span className="bg-green-100 px-3 py-1 rounded text-green-800 text-xs font-bold">✓ Veteran-Owned</span>
                              <span className="bg-green-100 px-3 py-1 rounded text-green-800 text-xs font-bold">✓ Family-Owned</span>
                              <span className="bg-green-100 px-3 py-1 rounded text-green-800 text-xs font-bold">✓ Locally Owned</span>
                            </div>
                            <p className="text-yellow-700 text-xs mt-2 italic">💡 The more attributes you check, the more Yelp filters you'll appear in. Most pros check 1-2; you'll check them all.</p>
                          </div>

                          <div className="bg-red-50 p-3 rounded mt-3 border-l-4 border-red-500">
                            <p className="font-bold text-red-800 text-sm mb-2">📸 Photo Upload (This Is Huge):</p>
                            <p className="text-red-700 text-sm">Yelp profiles with <strong>10+ photos</strong> get 2x more clicks than profiles with fewer than 5. Upload:</p>
                            <ul className="ml-4 text-xs space-y-1 mt-2">
                              <li>• 3-5 <strong>Before/After</strong> job photos (your best work)</li>
                              <li>• 1-2 photos of <strong>your truck/team</strong> (builds trust)</li>
                              <li>• 1-2 photos of <strong>your equipment or process</strong> (shows professionalism)</li>
                              <li>• 1 photo of <strong>you with a happy customer</strong> (social proof)</li>
                            </ul>
                            <p className="text-red-700 text-xs mt-2"><strong>🔧 TOOL SYNC:</strong> Use the <strong>📸 Before/After Story Generator</strong> to generate captions and alt-text for your best before/after photos.</p>
                          </div>

                          <div className="bg-purple-50 p-3 rounded mt-3 border-l-4 border-purple-500">
                            <p className="font-bold text-purple-800 text-sm mb-2">🛡️ The "No Ads" Reminder:</p>
                            <p className="text-purple-700 text-sm">Yelp <strong>will</strong> call you to sell ads. Don't buy them. Say: <em>"I'm using the free profile to manage my Apple Maps presence."</em> The free profile does everything you need.</p>
                          </div>
                        </div>

                        {/* Apple Business Connect */}
                        <div className="border-b border-slate-200 pb-4">
                          <strong className="text-yellow-700 text-lg">🍎 Part B: Apple Business Connect Audit</strong>
                          <p className="mt-2 text-slate-700 text-sm">You claimed this in Day 1. Now let's optimize it so Siri and CarPlay recommend you over everyone else.</p>

                          <div className="bg-white p-3 rounded mt-3 border border-slate-300">
                            <p className="font-bold text-slate-800 text-sm mb-2">📋 Apple Business Connect Optimization:</p>
                            <ol className="ml-4 text-sm space-y-2 list-decimal">
                              <li>Log into <a href="https://businessconnect.apple.com" target="_blank" className="text-blue-600 underline font-bold">Apple Business Connect</a></li>
                              <li><strong>Verify NAP Match:</strong> Your name, address, and phone must be identical to GBP and Yelp. Apple cross-references all three.</li>
                              <li><strong>Upload a Logo:</strong> This appears as your icon in Apple Maps — make it clean and recognizable.</li>
                              <li><strong>Add a Cover Photo:</strong> Choose your best truck/team photo — this is the first thing CarPlay users see.</li>
                              <li><strong>Create Your First "Showcase":</strong> Go to <strong>Showcases → Create.</strong> Upload a job photo with a short caption like <em>"Just completed a [service] in [neighborhood]!"</em></li>
                              <li><strong>Set Your Action Button:</strong> Choose <strong>"Call"</strong> — this puts a one-tap call button on every Apple Maps listing.</li>
                            </ol>
                          </div>

                          <div className="bg-green-50 p-3 rounded mt-3 border-l-4 border-green-500">
                            <p className="font-bold text-green-800 text-sm mb-2">💡 The "Showcase" Hack:</p>
                            <p className="text-green-700 text-sm">Showcases are Apple's version of Google Posts — but almost <strong>nobody uses them.</strong> Siri's algorithm weighs Showcase activity when deciding who to recommend. A weekly Showcase photo (already in your Wednesday roadmap) puts you miles ahead of competitors with a dead Apple profile.</p>
                          </div>
                        </div>

                        {/* The Cross-Platform Sync */}
                        <div>
                          <strong className="text-yellow-700 text-lg">🔗 Part C: The Cross-Platform Phone Sync</strong>
                          <div className="bg-blue-50 p-4 rounded mt-3 border-2 border-blue-500">
                            <p className="font-bold text-blue-800 mb-2">⚠️ Critical — Do This Now:</p>
                            <p className="text-blue-700 text-sm mb-2">Open all three platforms side-by-side and confirm your phone number is <strong>character-for-character identical</strong>:</p>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">☐</span>
                                <p className="text-sm"><strong>Google Business Profile:</strong> (XXX) XXX-XXXX</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">☐</span>
                                <p className="text-sm"><strong>Yelp:</strong> (XXX) XXX-XXXX ← must match exactly</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">☐</span>
                                <p className="text-sm"><strong>Apple Business Connect:</strong> (XXX) XXX-XXXX ← must match exactly</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-green-50 p-3 rounded mt-3 border-l-4 border-green-500">
                            <p className="text-green-800 font-bold text-sm">✅ Why This Matters:</p>
                            <p className="text-green-700 text-sm">When all three match, Apple Maps treats your listing as <strong>"verified and trusted."</strong> Mismatched numbers = Apple thinks you might be spam and buries your listing. This one check can be the difference between showing up on every iPhone in your area or being invisible.</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-yellow-100 rounded-lg border-l-4 border-yellow-600">
                        <p className="text-yellow-900 font-semibold">
                          📈 Impact: Optimized Yelp + Apple Business Connect + phone sync = dominant presence on every iPhone, Siri search, and CarPlay dashboard in your service area!
                        </p>
                      </div>
                    </div>
                  </details>

                  {/* STEP 5: Technical SEO Black Box */}
                  <details className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-4 border-2 border-indigo-500">
                    <summary className="font-bold text-xl text-indigo-900 cursor-pointer mb-3 hover:text-indigo-700">
                      🔧 STEP 5: Technical SEO "Black Box" | 15 min <span className="text-sm font-normal italic">(Click to expand)</span>
                    </summary>

                    <div className="mt-4 space-y-4 text-slate-800">
                      <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-500">
                        <p className="font-bold text-indigo-800 text-lg">🎯 The Goal: Verify your identity to the Google Overlords.</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg space-y-5">
                        {/* Task 1: GA4 */}
                        <div className="border-b border-slate-200 pb-4">
                          <strong className="text-indigo-700 text-lg">📊 TASK 1: Google Analytics 4 (GA4)</strong>
                          <ol className="ml-4 mt-2 text-sm space-y-2 list-decimal">
                            <li>Go to <a href="https://analytics.google.com" target="_blank" className="text-blue-600 underline font-bold">analytics.google.com</a></li>
                            <li>Create your free account</li>
                            <li>Copy your <code className="bg-slate-200 px-2 py-1 rounded">G-</code> code</li>
                            <li>Paste into your Carrd site settings (or website header)</li>
                          </ol>
                          <div className="bg-green-50 p-3 rounded mt-3 border-l-4 border-green-500">
                            <p className="text-green-800 font-bold text-sm">✅ The Win: Now you can see exactly how many people hit your "Call Now" button!</p>
                          </div>
                        </div>

                        {/* Task 2: Search Console */}
                        <div className="border-b border-slate-200 pb-4">
                          <strong className="text-indigo-700 text-lg">🔍 TASK 2: Google Search Console</strong>
                          <ol className="ml-4 mt-2 text-sm space-y-2 list-decimal">
                            <li>Go to <a href="https://search.google.com/search-console" target="_blank" className="text-blue-600 underline font-bold">search.google.com/search-console</a></li>
                            <li>Add your website</li>
                            <li>Submit your <code className="bg-slate-200 px-2 py-1 rounded">sitemap.xml</code></li>
                          </ol>
                          <div className="bg-blue-50 p-3 rounded mt-3 border-l-4 border-blue-500">
                            <p className="text-blue-800 font-bold text-sm">💡 Why: This is like telling Google, "Hey, I'm a real business. Please index my pages now."</p>
                          </div>
                        </div>

                        {/* Task 3: Robots.txt */}
                        <div>
                          <strong className="text-indigo-700 text-lg">🤖 TASK 3: The Robots.txt Check</strong>
                          <div className="bg-slate-50 p-3 rounded mt-2">
                            <p className="text-sm">Visit: <code className="bg-white px-2 py-1 rounded border">yourwebsite.com/robots.txt</code></p>
                          </div>
                          <div className="bg-green-50 p-3 rounded mt-3 border-l-4 border-green-500">
                            <p className="text-green-800 text-sm">✅ <strong>Good:</strong> As long as it doesn't say <code className="bg-red-100 px-2 py-1 rounded">Disallow: /</code>, you are open for business!</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-100 rounded-lg border-l-4 border-indigo-600">
                        <p className="text-indigo-900 font-semibold">
                          📈 Impact: These 3 tasks verify your legitimacy to Google = faster indexing + better rankings!
                        </p>
                      </div>
                    </div>
                  </details>

                  {/* Day 2 Completion */}
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl border-4 border-green-500">
                    <h4 className="text-2xl font-bold text-green-900 mb-4">🏆 DAY 2 COMPLETE!</h4>

                    <div className="bg-white p-4 rounded-lg mb-4">
                      <p className="text-green-900 font-bold text-xl text-center mb-3">
                        You have now done more for your business in 48 hours than most pros do in 4 years.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg mb-4">
                      <p className="font-bold text-lg mb-2 text-slate-800">⏱️ TIME INVESTED:</p>
                      <ul className="ml-4 space-y-1 text-slate-700">
                        <li>• Day 1: 1h 40min (Get live - 4 platforms basic setup)</li>
                        <li>• Day 2: 1h 45min (The Multiplier - GBP deep-dive + lead systems)</li>
                        <li><strong className="text-green-700">• TOTAL: 3h 25min</strong></li>
                      </ul>
                    </div>

                    <div className="bg-white p-4 rounded-lg mb-4">
                      <p className="font-bold text-lg mb-2 text-slate-800">📈 WHAT YOU NOW HAVE:</p>
                      <ul className="ml-4 space-y-1 text-slate-700">
                        <li>✅ Geotagged photos telling Google you're local</li>
                        <li>✅ Q&A section with hidden SEO keywords</li>
                        <li>✅ 20 zip codes of service area coverage</li>
                        <li>✅ Facebook blue badge + neighborhood group access</li>
                        <li>✅ Nextdoor keyword alerts for instant lead notifications</li>
                        <li>✅ Yelp synced with Apple Maps</li>
                        <li>✅ Analytics tracking your conversions</li>
                      </ul>
                    </div>

                    <div className="bg-purple-100 p-4 rounded-lg border-l-4 border-purple-600 mb-4">
                      <p className="text-purple-900 font-bold text-lg">🎯 YOUR FIRST HOMEWORK:</p>
                      <p className="text-purple-800 mt-1">Open the <strong>🔥 One Job = One Week of Content</strong> tool and turn your last completed job into 7 days of posts.</p>
                      <p className="text-purple-700 text-sm mt-2 italic">This tool is specifically designed to avoid "AI Ghosting" (shadow-bans) by making your posts sound like a real local pro.</p>
                    </div>

                    <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-600">
                      <p className="text-green-900 font-bold text-lg">🚀 THEN:</p>
                      <p className="text-green-800 mt-1">Ready for <strong>The Momentum Engine?</strong></p>
                      <p className="text-green-700 text-sm mt-2 italic">This is where we show you how to use AI to generate 30 days of social media posts in 15 minutes.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Algorithm Basics */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-blue-600">🤖 How Algorithms Work (What You MUST Know)</h3>

              <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-5 mb-4">
                <h4 className="font-bold text-lg text-yellow-900 mb-3">⚡ The Golden Rule:</h4>
                <p className="text-yellow-900 text-lg">
                  <strong>Platforms show your posts to people who ENGAGE with them.</strong> No engagement = invisible.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 border-l-4 border-blue-500 p-4">
                  <strong className="text-blue-700">✅ What Counts as Engagement (and WHY it matters):</strong>
                  <ul className="list-none ml-2 mt-2 text-slate-700 space-y-2">
                    <li>
                      <strong>👍 Likes, comments, shares</strong>
                      <p className="text-sm ml-6 text-slate-600">WHY: Tells the algorithm "people care about this content" → platform shows it to MORE people</p>
                    </li>
                    <li>
                      <strong>💾 Saves (Facebook)</strong>
                      <p className="text-sm ml-6 text-slate-600">WHY: Highest-value signal! Saves mean "this is so valuable I want it later" → algorithm LOVES this</p>
                    </li>
                    <li>
                      <strong>🔗 Click-throughs to your website</strong>
                      <p className="text-sm ml-6 text-slate-600">WHY: Shows your post drives action → platforms reward content that keeps users engaged</p>
                    </li>
                    <li>
                      <strong>⏱️ Watch time on videos</strong>
                      <p className="text-sm ml-6 text-slate-600">WHY: Longer watch time = more valuable content → algorithm pushes videos people actually watch</p>
                    </li>
                    <li>
                      <strong>🏷️ Hashtags</strong>
                      <p className="text-sm ml-6 text-slate-600">NOTE: Hashtags DON'T count as engagement, but they help people FIND your posts! Use 3-5 relevant hashtags per post (not 30 random ones)</p>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 border-l-4 border-red-500 p-4">
                  <strong className="text-red-700">❌ What KILLS Your Reach (and WHY):</strong>
                  <ul className="list-none ml-2 mt-2 text-slate-700 space-y-2">
                    <li>
                      <strong>👻 Posting then disappearing for weeks</strong>
                      <p className="text-sm ml-6 text-slate-600">WHY: Algorithm thinks you're inactive → stops showing your posts to followers</p>
                    </li>
                    <li>
                      <strong>🆘 Only posting when you need customers</strong>
                      <p className="text-sm ml-6 text-slate-600">WHY: Platforms detect desperation posting → penalize sporadic accounts that only show up for sales</p>
                    </li>
                    <li>
                      <strong>📸 Generic stock photos with no context</strong>
                      <p className="text-sm ml-6 text-slate-600">WHY: Algorithm prioritizes authentic content → stock photos get buried</p>
                    </li>
                    <li>
                      <strong>🙏 Asking for engagement ("like if you agree")</strong>
                      <p className="text-sm ml-6 text-slate-600">WHY: Platforms explicitly penalize "engagement bait" → this is in their terms of service</p>
                    </li>
                    <li>
                      <strong>🔗 Too many external links</strong>
                      <p className="text-sm ml-6 text-slate-600">WHY: Platforms want users to STAY on the platform → links send people away, so posts with links get less reach</p>
                    </li>
                    <li>
                      <strong>🤖 AI Ghosting (Alert!)</strong>
                      <p className="text-sm ml-6 text-slate-600">WHY: If you use "Raw AI" text that sounds like a robot, Facebook (Meta) and Google will shadow-ban the post. Always use the <strong>🔥 One Job = One Week</strong> tool—it's tuned to sound like a local human, not a tech company.</p>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4">
                  <strong className="text-green-700">🏆 How to Win the Algorithm:</strong>
                  <ul className="list-none ml-2 mt-2 text-slate-700">
                    <li>📅 <strong>Post consistently</strong> - 3-5x per week minimum (use the tools in this suite!)</li>
                    <li>📸 <strong>Use real job photos</strong> - algorithms prioritize authentic content over stock images</li>
                    <li>📖 <strong>Tell stories</strong> - "We fixed this homeowner's problem" beats "We do [service]"</li>
                    <li>💬 <strong>Respond to comments</strong> - shows the platform your content creates conversation</li>
                    <li>⏰ <strong>Post when audience is active</strong> - Evenings (6-9pm) and weekends for homeowners</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Essential Setup Links */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">🔗 Essential Setup Links (Quick Reference)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">📍 <strong>Google Business Profile:</strong> <a href="https://business.google.com" target="_blank" className="text-blue-600 underline font-bold">business.google.com</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">📘 <strong>Facebook Page Create:</strong> <a href="https://facebook.com/pages/create" target="_blank" className="text-blue-600 underline font-bold">facebook.com/pages/create</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">🏘️ <strong>Nextdoor Business:</strong> <a href="https://business.nextdoor.com" target="_blank" className="text-blue-600 underline font-bold">business.nextdoor.com</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">⭐ <strong>Yelp for Business:</strong> <a href="https://biz.yelp.com" target="_blank" className="text-blue-600 underline font-bold">biz.yelp.com</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">🍎 <strong>Apple Business Connect:</strong> <a href="https://businessconnect.apple.com" target="_blank" className="text-blue-600 underline font-bold">businessconnect.apple.com</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">🤖 <strong>Bing Places:</strong> <a href="https://www.bingplaces.com" target="_blank" className="text-blue-600 underline font-bold">bingplaces.com</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">📸 <strong>GeoImgr (Geotagging):</strong> <a href="https://geoimgr.com" target="_blank" className="text-blue-600 underline font-bold">geoimgr.com</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">📊 <strong>Google Analytics:</strong> <a href="https://analytics.google.com" target="_blank" className="text-blue-600 underline font-bold">analytics.google.com</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">🔍 <strong>Google Search Console:</strong> <a href="https://search.google.com/search-console" target="_blank" className="text-blue-600 underline font-bold">search.google.com/search-console</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">✅ <strong>Facebook (Meta) Verified:</strong> <a href="https://about.meta.com/technologies/meta-verified/" target="_blank" className="text-blue-600 underline font-bold">meta.com/meta-verified</a></p>
                </div>
              </div>
            </div>

            {/* Saturday 60 Bridge */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl mb-4 border-2 border-indigo-500">
              <h3 className="text-indigo-900 font-bold text-xl mb-3">📅 WHAT COMES NEXT</h3>
              <p className="text-indigo-800 leading-relaxed mb-3">
                You've built the foundation. Now open the <strong>📋 30-DAY DOMINATION ROADMAP</strong> — it schedules every post, photo, and review request across all the platforms you just set up. Your monthly <strong>Saturday 60</strong> review will circle back here to ensure your NAP stays consistent and your profiles stay 100% complete.
              </p>
              <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                <p className="text-orange-900 font-bold mb-1">🎯 Your Secret Weapon: The Seasonal Campaign Builder</p>
                <p className="text-orange-800 text-sm">Once you're in a rhythm with the Roadmap, run the <strong>🎯 Seasonal Campaign Builder</strong> once per quarter. One click generates a complete 6-piece campaign — 3-email drip sequence, 4 platform-specific social posts, Google Business offer, print flyer copy, 3 text blasts, and a week-by-week execution checklist. This is $3,000-5,000 of agency work generated in 90 seconds.</p>
              </div>
            </div>

            {/* Bottom Close Button */}
            <div className="text-center">
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 text-lg">
                ✕ Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MOMENTUM ENGINE (DAY 3) MODAL */}
      {activeModal === 'momentumEngine' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-5xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">🔥 THE MOMENTUM ENGINE</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-xl mb-6 border-2 border-orange-500">
              <h3 className="text-orange-900 font-bold text-2xl mb-3">From Setup to Sales in 20 Minutes</h3>
              <div className="bg-white/70 p-4 rounded-lg mb-4">
                <p className="text-orange-900 leading-relaxed">
                  <strong>The Reality Check:</strong> 90% of business owners set up their profiles and then let them sit like a <strong>digital graveyard.</strong> Today, <strong>Recency = Relevancy.</strong> If you haven't posted or received a review in the last 7 days, the Google and Facebook algorithms assume you are "closed" and will stop showing you to customers.
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg border-l-4 border-green-500 mb-4">
                <p className="text-green-900 font-bold">
                  💡 Momentum Stat: Profiles that post at least 3x per week and receive 1+ review weekly see a <span className="text-green-700 text-xl">400% increase</span> in "Near Me" search visibility compared to inactive profiles.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-900 text-sm">
                  <strong>💡 Why USE THIS:</strong> The internet is flooded with robot content. This module teaches you the "Human-Centric" workflow that bypasses AI filters. Turn one job into a week of content that actually gets seen, using your <strong>Review Maximizer</strong> and <strong>Single Job Multiplier</strong> to build a lead machine that runs while you're on the job site.
                </p>
              </div>
            </div>

            {/* Action 1: Single Job Multiplier */}
            <details className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-blue-500" open>
              <summary className="font-bold text-xl text-blue-900 cursor-pointer mb-3 hover:text-blue-700">
                1️⃣ The "Single Job" Multiplier <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800 text-lg">🎯 The Goal: Never wonder "what to post" again.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">❌ The Problem:</strong>
                    <p className="mt-1 text-slate-700">Most pros think they need to be "creative." <strong>You don't.</strong> You just need to <strong>document.</strong></p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">📸 The Action:</strong>
                    <p className="mt-1 text-slate-700">Take one photo from yesterday's job (before, after, or just your truck on the street). Open the <strong className="text-orange-600">🔥 One Job = One Week of Content</strong> tool in your library.</p>
                    <div className="bg-red-50 p-3 rounded mt-3 border-2 border-red-400">
                      <p className="text-red-900 font-bold text-sm">📍 METADATA PROOF — Read This First:</p>
                      <p className="text-red-800 text-sm mt-1">Ensure <strong>Location Services is ON</strong> when you take the photo. Google and Apple's AI read the hidden GPS "Metadata" in your image to prove you were actually at that job site. <strong>Stock photos are dead; real-time proof is the #1 ranking factor.</strong></p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded mt-2 border-l-4 border-blue-400">
                      <p className="text-blue-800 text-sm"><strong>🔧 What to Capture:</strong> Whether it's a new AC unit (HVAC), a drone shot of a shingle repair (Roofing), a freshly striped lawn (Landscaping), a panel upgrade (Electrician), or a scope camera in a drain (Plumber) — the AI looks for <strong>"Heavy Equipment"</strong> in the shot to verify your trade.</p>
                    </div>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700">⚙️ The Workflow:</strong>
                    <ol className="ml-4 mt-2 space-y-2 list-decimal">
                      <li>Enter the job type and location.</li>
                      <li>AI generates <strong>7 distinct angles</strong> (The Problem, The Solution, The Professional Tip, etc.).</li>
                      <li>Post <strong>Day 1 to Google Business</strong> and <strong>Day 2 to Facebook</strong> today.</li>
                    </ol>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-blue-900 font-bold text-sm mb-2">🎬 The "Hidden Reach" Hack (Algorithm Boost):</p>
                    <p className="text-blue-800 text-sm">After generating your 7 posts with the <strong>🔥 One Job = One Week</strong> tool, take the "Professional Tip" post and run it through the <strong>🎬 Video Script Command Center</strong>. Film a 30-second "Selfie Video" of that tip.</p>
                    <p className="text-blue-800 text-sm mt-2 font-bold">💡 Algorithms prioritize "Face-to-Camera" video over text by 5 to 1!</p>
                    <p className="text-blue-800 text-sm mt-2">📱 <strong>Not camera ready?</strong> Just point the phone at the equipment you're working on and talk over it. The AI still hears your voice and sees the live job—that's all the "Proof" it needs.</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">✅ The Result:</strong>
                    <p className="mt-1 text-green-700">You now have a full week of authority-building content that proves you are <strong>active, local, and busy.</strong></p>
                  </div>
                </div>
              </div>
            </details>

            {/* Action 2: Review-on-the-Spot */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl mb-4 border-2 border-yellow-500">
              <summary className="font-bold text-xl text-yellow-900 cursor-pointer mb-3 hover:text-yellow-700">
                2️⃣ The "Review-on-the-Spot" Habit <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800 text-lg">🎯 The Goal: Build a mountain of 5-star reviews while the customer is happiest.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">❌ The Problem:</strong>
                    <p className="mt-1 text-slate-700">If you wait until you get home to ask for a review, the conversion rate drops by <strong className="text-red-600">70%.</strong></p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-yellow-700">🚗 The Action:</strong>
                    <p className="mt-1 text-slate-700">Before you put your truck in "Drive" to leave the job site, open the <strong className="text-orange-600">⭐ Review Maximizer</strong> tool.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700">⚙️ The Workflow:</strong>
                    <ol className="ml-4 mt-2 space-y-2 list-decimal">
                      <li>Generate a personalized request link using the tool.</li>
                      <li><strong>Text it to the customer before you leave the driveway.</strong></li>
                      <li><strong className="text-orange-600">The Multiplier:</strong> Once they post the review, copy that review text into the <strong>⭐ Review Maximizer</strong> tool to generate a keyword-rich reply and a "Social Proof" post for Nextdoor.</li>
                    </ol>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <p className="text-purple-900 font-bold text-sm mb-2">📸 The "Photo Weight" Hack (Google AI Boost):</p>
                    <p className="text-purple-800 text-sm">Ask the customer to take a photo of your professional equipment for their review. Google gives reviews with photos <strong>3x more "weight"</strong> in your ranking.</p>
                    <p className="text-purple-700 text-xs mt-1">📸 Examples: Electrician → multimeter/panel; HVAC → manifold gauges; Plumber → scope camera; Roofer → drone shot; Restoration → thermal camera/moisture meter</p>
                    <p className="text-purple-700 text-xs mt-2"><strong>🔧 TOOL SYNC:</strong> Paste your review into the <strong>⭐ Review Maximizer</strong> and mention the equipment you used in the "Service Provided" field (e.g., "thermal imaging scan," "RIDGID camera inspection"). The tool generates a social post that highlights your tech — telling Google's AI you're using professional-grade equipment in that zip code.</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-400">
                    <p className="text-orange-900 font-bold text-sm mb-2">🍎 The "Apple/Bing Sync" Hack:</p>
                    <p className="text-orange-800 text-sm">When you copy that review text into the <strong>⭐ Review Maximizer</strong>, don't just post it to Facebook. Post it as an <strong>"Update"</strong> on <strong>Apple Business Connect</strong> and <strong>Bing Places</strong>. This tells Siri and ChatGPT that you are currently active and solving problems in that specific neighborhood <strong>today.</strong></p>
                    <p className="text-orange-700 text-xs mt-2"><strong>🔧 TOOL SYNC:</strong> See <strong>🚀 Unfair Advantage Guide</strong> → Platforms #1 (Apple) and #2 (Bing) for step-by-step instructions on posting updates.</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">✅ The Result:</strong>
                    <p className="mt-1 text-green-700">You turn <strong>one happy customer</strong> into a permanent "Trust Signal" that attracts the <strong>next ten neighbors.</strong></p>
                  </div>
                </div>
              </div>
            </details>

            {/* Action 3: Lead Sniper Routine */}
            <details className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl mb-4 border-2 border-red-500">
              <summary className="font-bold text-xl text-red-900 cursor-pointer mb-3 hover:text-red-700">
                3️⃣ The "Lead Sniper" Routine <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                  <p className="font-bold text-red-800 text-lg">🎯 The Goal: Find the people who are already looking for you.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">❌ The Problem:</strong>
                    <p className="mt-1 text-slate-700">Waiting for the phone to ring is a <strong>"Defense"</strong> strategy. Today we play <strong className="text-green-600">"Offense."</strong></p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">🎯 The Action:</strong>
                    <p className="mt-1 text-slate-700">Open the <strong className="text-orange-600">🕵️ Competitor Intel</strong> tool.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700">⚙️ The Workflow:</strong>
                    <ol className="ml-4 mt-2 space-y-2 list-decimal">
                      <li>Input the name of a big-budget franchise competitor.</li>
                      <li>The AI analyzes their <strong>weak points</strong> (e.g., they are expensive, impersonal, or have slow response times).</li>
                      <li>The tool generates a <strong>ready-to-post response</strong> that positions you as the better local alternative. Post it in your <strong>5 Local Neighborhood Groups.</strong></li>
                    </ol>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border-2 border-red-400">
                    <p className="text-red-900 font-bold text-sm mb-2">📞 The "Response Gap" Play:</p>
                    <p className="text-red-800 text-sm">Use the <strong>🕵️ Competitor Intel</strong> tool to find which big franchises in your area have <strong>"Disconnected" phone systems</strong> or slow AI chatbots. Position yourself in Neighborhood Groups as the <strong>"Live Local Expert"</strong> who answers the phone when the big guys won't.</p>
                    <p className="text-red-700 text-xs mt-2 italic">💡 Homeowners hate calling a 1-800 number and getting a robot. One post saying "I answer my own phone" can generate 5+ DMs.</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">✅ The Result:</strong>
                    <p className="mt-1 text-green-700">You aren't just saying "I'm a [your trade]." You are saying <strong>"I'm the local neighbor who fixes what the big guys overcharge you for."</strong></p>
                  </div>
                </div>
              </div>
            </details>

            {/* Pro Tips Section */}
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-xl mb-6 border-2 border-purple-500">
              <h3 className="text-purple-900 font-bold text-xl mb-4">💡 Pro-Tips for Momentum Success</h3>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                  <strong className="text-purple-700">⏱️ The 60-Minute Rule:</strong>
                  <p className="mt-1 text-slate-700">When you post today, <strong>stay on your phone for 10 minutes.</strong> If someone comments, reply immediately. This <strong>"spikes"</strong> the algorithm and <strong>doubles your reach.</strong></p>
                </div>

                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                  <strong className="text-purple-700">📦 Batching:</strong>
                  <p className="mt-1 text-slate-700">If you have 3 jobs today, only document <strong>ONE.</strong> Don't overwhelm yourself. <strong>Consistency beats intensity every time.</strong></p>
                </div>
              </div>
            </div>

            {/* Momentum Task Completion */}
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl border-4 border-green-500">
              <h4 className="text-2xl font-bold text-green-900 mb-4">🏆 DAY 3 TASK</h4>

              <div className="bg-white p-4 rounded-lg mb-4">
                <p className="text-green-900 font-bold text-lg mb-3">Complete these 3 actions before 5:00 PM today:</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-green-800">Action 1: Single Job Multiplier</p>
                      <p className="text-sm text-green-700">Use the 🔥 One Job = One Week tool and post Day 1 to GBP, Day 2 to Facebook</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-green-800">Action 2: Review-on-the-Spot</p>
                      <p className="text-sm text-green-700">Use the ⭐ Review Maximizer before leaving your next job site</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-green-800">Action 3: Lead Sniper Routine</p>
                      <p className="text-sm text-green-700">Use the 🕵️ Competitor Intel tool and post in your neighborhood groups</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-4 rounded-lg border-l-4 border-orange-500">
                <p className="text-orange-900 font-bold text-xl text-center">
                  🎉 Once finished, you are officially <span className="text-green-700">"In Motion."</span>
                </p>
                <p className="text-orange-800 text-center mt-2">The algorithms now see you as an ACTIVE, TRUSTED local professional.</p>
              </div>
            </div>

            {/* THE REPUTATION SHIELD */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl mb-4 border-2 border-yellow-500">
              <summary className="font-bold text-xl text-yellow-900 cursor-pointer mb-3 hover:text-yellow-700">
                💬 THE REPUTATION SHIELD (Review Masterclass) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800 text-lg">🎯 How to get 5-stars every time and use them to dominate the algorithm.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  {/* Strategy 1: Pre-Review Qualifier - FTC Safe-Guard */}
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-yellow-700 text-lg">1️⃣ The "Pre-Review" Qualifier (FTC Safe-Guard Workflow)</strong>
                    <p className="mt-2 text-slate-700">Before sending a public link, send a quick text asking:</p>
                    <div className="bg-yellow-50 p-3 rounded mt-2 border-l-4 border-yellow-500">
                      <p className="text-yellow-800 italic">"On a scale of 1-10, how happy are you with our work today?"</p>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                        <p className="text-sm text-green-800 font-bold">✓ If they say 9 or 10 (The "Fast Track"):</p>
                        <p className="text-sm text-slate-700 mt-1 italic">"That's what we love to hear! It would mean the world to our local team if you'd share that. Here is a link: [Google Link]. (Pro tip: Mentioning your neighborhood helps us rank better!)"</p>
                      </div>

                      <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
                        <p className="text-sm text-orange-800 font-bold">⚠️ If they say 8 or lower (The "Fix-It" Pivot):</p>
                        <p className="text-sm text-slate-700 mt-1 italic">"Thank you for the honest feedback. Our goal is always a 10. I'm sending you our formal feedback link now [Private Google Form or Website Contact Page] so I can personally review this and make it right. Once we've addressed your concerns, we'd still love for you to share your final experience on Google!"</p>
                      </div>

                      <div className="bg-red-100 p-3 rounded mt-2 border-2 border-red-500">
                        <p className="text-sm text-red-900 font-bold">🚨 EMERGENCY RECOVERY:</p>
                        <p className="text-sm text-red-800 mt-1">If they reply with a 1-8 rating, <strong>STOP. Do not send a Google link.</strong> Open the <strong>💬 Objection Handler</strong> → Select "Post-Service: Low Rating" → Use the "Immediate Save" phone script to <strong>call them within 5 minutes.</strong></p>
                        <p className="text-xs text-red-700 mt-1 italic">💡 Winning back a hater is easier than getting 5 new fans.</p>
                      </div>
                    </div>

                    <div className="bg-red-50 p-3 rounded mt-3 border-2 border-red-300">
                      <p className="text-sm text-red-800 font-bold">⚖️ FTC COMPLIANCE NOTE:</p>
                      <p className="text-sm text-red-700 mt-1">The FTC now fines businesses for "Review Gating" (only sending links to happy customers). This workflow is 100% legal because:</p>
                      <ul className="text-xs text-red-700 mt-2 ml-4 space-y-1">
                        <li>• You're NOT blocking anyone from reviewing—you're directing them to Service Recovery FIRST</li>
                        <li>• Everyone gets the Google link eventually (after resolution for 1-8s)</li>
                        <li>• A few "Fixed" reviews actually make your profile look more authentic to Google's AI</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-2 rounded mt-2">
                      <p className="text-xs text-purple-700">💡 <strong>Pro Move:</strong> Many 3-star reviews happen because of small misunderstandings. By catching it in the Qualifier phase, you often turn a potential 3-star into a loyal 5-star because you cared enough to fix it first!</p>
                    </div>

                    <div className="bg-blue-50 p-2 rounded mt-2 border-l-4 border-blue-500">
                      <p className="text-xs text-blue-700"><strong>🔧 Tool:</strong> For 1-8 ratings, open <strong>💬 Objection Handler</strong> → Select "Post-Service: Customer gave a low rating" → Get Phone, Text, and In-Person recovery scripts!</p>
                    </div>
                  </div>

                  {/* Strategy 2: SEO Keyword Reply */}
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700 text-lg">2️⃣ The SEO "Keyword" Reply</strong>
                    <p className="mt-2 text-slate-700">Google's AI reads your replies to understand what services you provide and where. When you thank a customer, <strong>subtly include your service and city.</strong></p>
                    <div className="bg-blue-50 p-3 rounded mt-2 border-l-4 border-blue-500">
                      <p className="text-blue-800 font-bold text-sm mb-1">Examples (adapt for YOUR trade):</p>
                      <p className="text-blue-800 text-sm">🔧 <em>"Thanks! We were happy to help with the <strong>panel upgrade</strong> in <strong>Lower Paxton</strong>."</em></p>
                      <p className="text-blue-800 text-sm">❄️ <em>"Glad we could get your <strong>AC running</strong> again in <strong>Skyline View</strong>!"</em></p>
                      <p className="text-blue-800 text-sm">🏠 <em>"It was great replacing those <strong>storm-damaged shingles</strong> in <strong>Cedar Heights</strong>."</em></p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded mt-2 border-2 border-purple-400">
                      <p className="text-purple-900 font-bold text-sm mb-1">🤖 AI Authority Boost — Mention a Technical Tool:</p>
                      <p className="text-purple-800 text-sm">In your reply, mention a <strong>specific piece of equipment or brand.</strong> This signals to AI engines (ChatGPT, Gemini, Siri) that you are an <strong>"Authority,"</strong> not just a generic handyman.</p>
                      <p className="text-purple-800 text-sm mt-1">💡 <em>"Glad we could help with the panel upgrade in [City] using our <strong>[Brand/Tool]</strong> for safety!"</em></p>
                      <p className="text-purple-700 text-xs mt-1">Examples: Fluke multimeter, Testo manifold gauges, RIDGID SeeSnake, DJI drone inspection, FLIR thermal scan</p>
                    </div>
                  </div>

                  {/* Strategy 3: 60-Minute Rule */}
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700 text-lg">3️⃣ The "60-Minute" Rule</strong>
                    <p className="mt-2 text-slate-700">Send your review request via text <strong>within 60 minutes</strong> of finishing the job. The "gratitude window" closes fast once the customer moves on with their day.</p>
                  </div>

                  {/* Strategy 4: Photo Weight Hack */}
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700 text-lg">4️⃣ The "Photo Weight" Hack</strong>
                    <p className="mt-2 text-slate-700">If a customer includes a photo in their review and you reply to it, Google gives that review <strong className="text-purple-700">3x more "weight"</strong> in your ranking.</p>
                    <p className="mt-2 text-slate-600 text-sm italic">💡 Encourage customers to take a photo of the professional equipment you used — multimeter, manifold gauges, scope camera, thermal imager, or even your branded truck on their street.</p>
                  </div>

                  {/* Strategy 5: One-Tap Deep Link */}
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-green-700 text-lg">5️⃣ The "One-Tap" Deep Link</strong>
                    <p className="mt-2 text-slate-700">Don't just send a generic link to your profile. Use your <strong>Google Review Short Link:</strong></p>
                    <div className="bg-green-50 p-3 rounded mt-2 border-l-4 border-green-500 font-mono text-sm">
                      <p className="text-green-800">g.page/YourBusinessName/review</p>
                    </div>
                    <p className="mt-2 text-slate-600 text-sm">This opens the 5-star rating box immediately, removing extra clicks and <strong>increasing completion rates by 20%.</strong></p>

                    <div className="bg-yellow-50 p-2 rounded mt-2 border-l-4 border-yellow-500">
                      <p className="text-yellow-800 text-xs"><strong>⚠️ Verify your link:</strong> Open it in an Incognito/Private window. If the 5-star box doesn't pop up immediately, your link is outdated. Grab the fresh one from your Google Business Dashboard under "Get More Reviews."</p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded mt-3 border-l-4 border-blue-500">
                      <p className="text-blue-800 font-bold text-sm mb-2">🔗 Essential Links:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• <strong>Find your Google Review Link:</strong> <a href="https://business.google.com" target="_blank" className="underline">business.google.com</a> → Your Profile → "Get more reviews" button</li>
                        <li>• <strong>Nextdoor Neighborhood Search:</strong> <a href="https://nextdoor.com/find-neighborhood/" target="_blank" className="underline">nextdoor.com/find-neighborhood/</a> (Find groups to post Review Maximizer content)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Review Request Text Templates */}
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg border-2 border-green-500">
                  <h4 className="font-bold text-green-900 text-lg mb-3">📲 Review Request Text Templates</h4>
                  <p className="text-green-800 text-sm mb-3">Save these in your phone's "Notes" app for quick copy-pasting:</p>

                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-green-800 text-sm mb-1">🦸 The Hero Script (For Emergencies):</p>
                      <p className="text-slate-700 text-sm italic">"Hi [Name], this is [Your Name] from [Your Company]. I'm so glad we could take care of that [service] for you today! If you have 30 seconds, would you mind sharing a quick review? It helps other neighbors in [Neighborhood] find us when they're in a pinch! [Link]"</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-bold text-green-800 text-sm mb-1">👷 The Team Recognition Script:</p>
                      <p className="text-slate-700 text-sm italic">"Hey [Name], [Technician Name] just headed back to the shop. If you were happy with his work, would you mind mentioning him in a quick Google review? It's how we recognize our best guys! [Link]"</p>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* Saturday 60 Bridge */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl mb-4 border-2 border-indigo-500">
              <h3 className="text-indigo-900 font-bold text-xl mb-3">📅 ONGOING MOMENTUM</h3>
              <p className="text-indigo-800 leading-relaxed mb-3">
                All these daily and post-job habits are scheduled for you in the <strong>📋 30-DAY DOMINATION ROADMAP</strong>. Don't try to remember this—just follow the checklist!
              </p>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-indigo-700 text-sm">
                  <strong>📊 The "Saturday 60"</strong> (last Saturday of each month) is where you audit your progress and adjust your strategy based on real data. It's all in the roadmap.
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg mt-3 border-l-4 border-orange-400">
                <p className="text-orange-800 text-sm">
                  <strong>🎯 QUARTERLY POWER MOVE:</strong> Every 3 months, run the <strong>🎯 Seasonal Campaign Builder</strong> during your Saturday 60. It generates a full multi-channel campaign (emails, social, flyer, texts, GBP, checklist) in one click. Schedule it for the first Saturday 60 of March, June, September, and December.
                </p>
              </div>
            </div>

            {/* One-Minute Momentum Check */}
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-xl mb-4 border-4 border-yellow-500">
              <h3 className="text-yellow-900 font-bold text-xl mb-3">⚡ THE "ONE-MINUTE" MOMENTUM CHECK</h3>
              <p className="text-yellow-800 mb-4 font-semibold">Before you start your first job of the day:</p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                  <span className="text-2xl">🍎</span>
                  <div>
                    <p className="font-bold text-slate-800">1. Check Siri</p>
                    <p className="text-sm text-slate-700">Ask your car: <strong>"Siri, find a [your trade] near me."</strong> Ensures your Apple Place Card is live and showing up.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="font-bold text-slate-800">2. Check WhatsApp</p>
                    <p className="text-sm text-slate-700">Post one <strong>"Job-in-Progress"</strong> photo to your WhatsApp Business Channel. 98% of your subscribers will see it.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-red-500">
                  <span className="text-2xl">🏘️</span>
                  <div>
                    <p className="font-bold text-slate-800">3. Check Nextdoor</p>
                    <p className="text-sm text-slate-700">Look at your Keyword Alerts for the last 12 hours. Someone posted <em>"need help," "recommendation,"</em> or <em>"emergency"</em> — be the first to respond.</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-100 p-3 rounded-lg mt-4 border-2 border-green-500 text-center">
                <p className="text-green-900 font-bold text-lg">⏱️ Total Time: 60 Seconds &nbsp;|&nbsp; 💰 Total Value: Potential $10k in leads</p>
              </div>
            </div>

            {/* Essential Momentum Links */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mt-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">🔗 Essential Momentum Links</h3>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>📍 Google Review Link:</strong> <a href="https://business.google.com" target="_blank" className="text-blue-600 underline font-bold">business.google.com</a> → Your Profile → "Get more reviews" → Copy short link</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🏘️ Nextdoor Neighborhood Search:</strong> <a href="https://nextdoor.com/find-neighborhood/" target="_blank" className="text-blue-600 underline font-bold">nextdoor.com/find-neighborhood</a> (Find groups to monitor)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🍎 Apple Business Connect:</strong> <a href="https://businessconnect.apple.com" target="_blank" className="text-blue-600 underline font-bold">businessconnect.apple.com</a> (Claim your Siri & Apple Maps listing)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>📘 Facebook Ad Library:</strong> <a href="https://www.facebook.com/ads/library" target="_blank" className="text-blue-600 underline font-bold">facebook.com/ads/library</a> (Spy on competitor ads — free)</p>
                </div>
              </div>
            </div>

            {/* Bottom Close Button */}
            <div className="text-center mt-6">
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 text-lg">
                ✕ Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* VISIBILITY PLAYBOOK MODAL */}
      {activeModal === 'visibilityPlaybook' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-5xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">🚀 THE VISIBILITY PLAYBOOK</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">💡 The Visibility Problem</h3>
              <p className="text-blue-900 leading-relaxed mb-3">
                You can create amazing content, but if the algorithm doesn't show it to anyone, it's wasted effort.
                This playbook teaches you exactly how to work WITH the algorithm to maximize every post's reach.
              </p>
              <p className="text-blue-900 leading-relaxed">
                <strong>Goal:</strong> Turn your posts from "seen by 20 people" to "seen by 2,000 people" without paying for ads.
              </p>
            </div>

            {/* AI Insight */}
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-xl mb-6 border-2 border-purple-500">
              <h3 className="text-purple-900 font-bold text-xl mb-3">🤖 AI Photo Recognition Insight</h3>
              <p className="text-purple-900 leading-relaxed">
                Platforms like Google and Facebook (Meta) now use AI to <strong>"read" your photos.</strong> If you use the <strong className="text-orange-600">📸 Before/After Story Generator</strong> from our tools, the AI recognizes the "Solution" in the image and <strong>automatically shows your post to people searching for that specific fix.</strong>
              </p>
              <p className="text-purple-800 text-sm mt-3 italic">
                💡 A photo of a repaired panel gets shown to "electrician near me" searches. A new AC unit gets shown to "HVAC near me." A patched roof gets shown to "roofer near me" — all without paying for ads!
              </p>
              <div className="bg-white p-3 rounded-lg mt-3 border-l-4 border-blue-500">
                <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Use the <strong>📸 Before/After Story Generator</strong> before you post. Facebook's (Meta) AI scans for "High Contrast" (dirty vs. clean, broken vs. fixed). This tool generates the <strong>Alt-Text</strong> and captions that tell the AI exactly what it's looking at, resulting in a <strong>3x boost in non-follower reach.</strong></p>
              </div>
            </div>

            <div className="space-y-6">

              {/* First Hour Strategy */}
              <div className="bg-purple-50 border-2 border-purple-500 rounded-xl p-6">
                <h4 className="font-bold text-2xl text-purple-800 mb-4">⏰ The First Hour is CRITICAL</h4>
                <p className="text-slate-700 mb-4 text-lg">
                  The algorithm decides whether to show your post to MORE people based on engagement in the first 60 minutes.
                  If it gets likes/comments/shares quickly, the platform pushes it to a wider audience. If it dies in the first hour, it stays buried.
                </p>
                <div className="bg-white p-4 rounded-lg">
                  <strong className="text-purple-700 text-lg">🎯 Tactical Actions:</strong>
                  <ul className="list-none ml-2 mt-3 text-slate-700 space-y-3">
                    <li>
                      <strong>📱 Post when your audience is online</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        For homeowners: 6-9pm weekdays, 10am-2pm weekends (when they're scrolling)<br/>
                        For B2B/commercial: 11am-1pm and 5-7pm (lunch break and commute home)<br/>
                        Check your Facebook Insights to see when YOUR specific followers are most active
                      </p>
                    </li>
                    <li>
                      <strong>💬 Respond to EVERY comment in the first hour</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        Each response counts as new engagement → boosts the post in the algorithm<br/>
                        Set a 60-minute timer after posting. Drop everything to respond to comments during this window.<br/>
                        Even a simple "Thanks for the support!" counts - just keep the conversation going
                      </p>
                    </li>
                    <li>
                      <strong>📤 Share to your Facebook Story immediately</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        Post to feed → immediately share to your Facebook Story<br/>
                        Drives your followers to engage with the feed post<br/>
                        Story views don't count as engagement, but the clicks TO the post do
                      </p>
                    </li>
                    <li>
                      <strong>💼 Give your team a 5-minute heads-up</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        Text your employees/family: "Just posted, can you like/comment in the next 5 mins?"<br/>
                        This is NOT engagement bait (which is public begging for likes)<br/>
                        This is smart strategy - initial momentum triggers algorithm favor
                      </p>
                    </li>
                    <li>
                      <strong>📨 Send to a few customers via DM</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        Pick 3-5 recent happy customers<br/>
                        DM them: "Hey! Just posted about that [job/service] - thought you'd like to see it!"<br/>
                        If they click and engage, algorithm sees "high interest" signal
                      </p>
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 mt-3">
                  <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Use the <strong>🔥 One Job = One Week</strong> tool to generate "Engagement Questions" for your posts. A simple "Have you ever dealt with this?" at the end of a caption triggers the first-hour comment strategy without being engagement bait.</p>
                </div>
              </div>

              {/* How the Algorithm Works */}
              <div className="bg-slate-50 border-2 border-slate-500 rounded-xl p-6">
                <h4 className="font-bold text-2xl text-slate-800 mb-4">🤖 How the Algorithm Works (Master This!)</h4>
                <p className="text-slate-700 mb-4 text-lg">
                  Understanding what the algorithm rewards vs. punishes is the difference between 50 views and 5,000 views on the same post.
                </p>

                <div className="bg-white p-4 rounded-lg mb-4">
                  <strong className="text-green-700 text-lg">✅ What Counts as Engagement (TOP 5 - MASTER THESE FIRST!):</strong>
                  <p className="text-xs text-green-600 mt-1 mb-3 italic">Focus on these 5 highest-impact signals, then expand for the full list</p>
                  <ul className="list-none ml-2 mt-3 text-slate-700 space-y-3">
                    <li>
                      <strong>💬 Comments (weighted HIGHEST!)</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        WHY: Comments = meaningful interaction → algorithm heavily favors posts that create conversation<br/>
                        YOUR replies to comments = additional engagement signals → respond to EVERY comment!
                      </p>
                    </li>
                    <li>
                      <strong>💾 Saves/Bookmarks (Facebook - HIGHEST VALUE!)</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        WHY: "This is so valuable I want it later" signal → algorithm LOVES this more than likes<br/>
                        Educational tips and how-to posts get saved → post these to boost reach
                      </p>
                      <p className="text-sm ml-6 mt-2 text-orange-700 font-semibold bg-orange-50 p-2 rounded">
                        💡 Tip: Use the <strong>💡 Daily Tip Generator</strong> to create "How-To" posts. These are the #1 most-saved content type on Facebook!
                      </p>
                    </li>
                    <li>
                      <strong>🔄 Shares/Reshares</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        WHY: Someone sharing your post = ultimate endorsement → exponentially increases your reach<br/>
                        Each share puts your content in front of their entire network
                      </p>
                    </li>
                    <li>
                      <strong>⏱️ Watch Time on Videos (50%+ completion)</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        WHY: Videos watched to 50%+ = valuable content → algorithm massively boosts video reach<br/>
                        Keep videos under 60 seconds for best completion rates
                      </p>
                      <p className="text-sm ml-6 mt-2 text-orange-700 font-semibold bg-orange-50 p-2 rounded">
                        💡 Tip: Use the <strong>🎬 Video Script Command Center</strong> to ensure your first 3 seconds "hook" the viewer—the secret to getting that 50% completion rate!
                      </p>
                      <div className="ml-6 mt-2 bg-blue-50 p-2 rounded border-l-4 border-blue-500">
                        <p className="text-blue-800 text-xs"><strong>🔧 TOOL SYNC:</strong> When using the <strong>🎬 Video Script Command Center</strong>, look for <strong>Script #8: The 3-Second Pattern Interrupt</strong>. Viewers decide to scroll in 1.5 seconds. If you don't hook them by the time they see your face, the algorithm kills the video. This script is specifically designed to stop the scroll.</p>
                      </div>
                    </li>
                    <li>
                      <strong>🔗 Click-throughs (Links, CTAs, Directions, Calls)</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        WHY: Shows your post drives action → platforms reward content that achieves business goals<br/>
                        GBP: Calls and direction requests are MAJOR ranking factors
                      </p>
                    </li>
                  </ul>

                  <details className="mt-4">
                    <summary className="cursor-pointer text-green-700 font-semibold hover:text-green-800">
                      ▼ Click to see 6 more engagement signals (The "Micro-Wins")
                    </summary>
                    <ul className="list-none ml-2 mt-3 text-slate-700 space-y-3">
                      <li>
                        <strong>👤 Profile Visits</strong>
                        <p className="text-sm ml-6 mt-1 text-slate-600">
                          WHY: Clicking your name to see your main page = high curiosity signal<br/>
                          The algorithm tracks this and uses it to decide if you're worth promoting to more people
                        </p>
                      </li>
                      <li>
                        <strong>🔍 Image Expands</strong>
                        <p className="text-sm ml-6 mt-1 text-slate-600">
                          WHY: Clicking a photo to see it full-screen = content valuable enough to examine closely<br/>
                          Before/after photos get expanded 3x more than single photos
                        </p>
                      </li>
                      <li>
                        <strong>💌 DMs (Direct Messages)</strong>
                        <p className="text-sm ml-6 mt-1 text-slate-600">
                          WHY: Starting a private conversation = HIGH INTENT signal<br/>
                          Quick response to DMs earns "Very responsive" badge on Facebook → more trust
                        </p>
                      </li>
                      <li>
                        <strong>🏷️ Tags</strong>
                        <p className="text-sm ml-6 mt-1 text-slate-600">
                          WHY: When a neighbor tags a friend in your comments = organic word-of-mouth<br/>
                          The algorithm LOVES posts that create "tag a friend who needs this" moments
                        </p>
                      </li>
                      <li>
                        <strong>📱 Story Replies</strong>
                        <p className="text-sm ml-6 mt-1 text-slate-600">
                          WHY: Direct feedback on your daily stories = active audience engagement<br/>
                          Story replies signal "this person has followers who actually care what they post"
                        </p>
                      </li>
                      <li>
                        <strong>#️⃣ Hashtag Follows</strong>
                        <p className="text-sm ml-6 mt-1 text-slate-600">
                          WHY: People finding you because they follow #LocalService or #YourCity<br/>
                          Use 3-5 relevant local hashtags to get discovered by people who don't know you yet
                        </p>
                      </li>
                    </ul>
                  </details>
                </div>

                <div className="bg-white p-4 rounded-lg mb-4">
                  <strong className="text-red-700 text-lg">❌ What KILLS Your Reach (TOP 5 - AVOID AT ALL COSTS!):</strong>
                  <p className="text-xs text-red-600 mt-1 mb-3 italic">These 5 mistakes destroy reach instantly. Master these first, then expand for the full list</p>
                  <ul className="list-none ml-2 mt-3 text-slate-700 space-y-3">
                    <li>
                      <strong>📢 Pure sales posts with no value ("Call us today!")</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        WHY: People scroll past ads → zero engagement = algorithm buries it immediately<br/>
                        FIX: ALWAYS lead with value/story/tip, THEN add CTA at end<br/>
                        ❌ "Need HVAC service? Call us!" vs ✅ "Here's why your AC is freezing up (and what it costs to ignore it). Free assessment: [phone]"
                      </p>
                    </li>
                    <li>
                      <strong>📝 Text-only posts with no visuals</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        WHY: Image/video posts get 6-10x more engagement than text alone → people scroll right past text blocks<br/>
                        FIX: EVERY post needs a photo or video. No exceptions.<br/>
                        Quick solution: If no job photo, take picture of your truck, tools, or team
                      </p>
                    </li>
                    <li>
                      <strong>🤐 Not responding to comments or messages</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        WHY: Algorithm sees "dead" engagement → thinks content isn't valuable enough to promote<br/>
                        FIX: Respond to EVERY comment within 1 hour (especially first hour after posting). DMs within 15 min when possible<br/>
                        Your replies count as additional engagement signals!
                      </p>
                    </li>
                    <li>
                      <strong>📦 Batch posting (5 posts in one day, then nothing for 2 weeks)</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        WHY: Algorithm punishes inconsistency → thinks you're inactive and stops showing posts to followers<br/>
                        FIX: Consistency > volume. Post 3x per week EVERY week beats 15 posts then disappearing<br/>
                        Use the 30-Day Calendar tool to plan ahead and stay consistent
                      </p>
                      <div className="ml-6 mt-2 bg-yellow-50 p-2 rounded border-l-4 border-yellow-500">
                        <p className="text-yellow-800 text-xs"><strong>💡 AI Warning:</strong> Avoid "Cross-Posting" the exact same caption to Facebook, Google, and Nextdoor at the same second. The algorithms now detect "Carbon-Copy" content. Use the <strong>🔥 One Job = One Week</strong> tool to slightly tweak the tone for each platform so they each feel native and unique.</p>
                      </div>
                    </li>
                    <li>
                      <strong>📸 Blurry, dark, or unprofessional photos</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        WHY: Bad photo quality signals low-quality business → algorithm + people skip it<br/>
                        FIX: Use phone's portrait mode, turn on lights/use natural light, wipe camera lens clean<br/>
                        Rule: If you wouldn't put it on your website, don't put it on social media
                      </p>
                    </li>
                  </ul>

                  <details className="mt-4">
                    <summary className="cursor-pointer text-red-700 font-semibold hover:text-red-800">
                      ▼ Click to see 9 more reach killers (The "Invisible Penalties")
                    </summary>
                    <ul className="list-none ml-2 mt-3 text-slate-700 space-y-3">
                      <li>
                        <strong>📸 Stock Photos</strong>
                        <p className="text-sm ml-6 mt-1 text-slate-600">
                          WHY: AI recognizes them <strong>instantly</strong> and demotes the post<br/>
                          FIX: Use YOUR actual job photos. Even imperfect real photos beat perfect stock images
                        </p>
                      </li>
                      <li>
                        <strong>📹 Bad Video Ratios</strong>
                        <p className="text-sm ml-6 mt-1 text-slate-600">
                          WHY: Posting horizontal video on a vertical platform (Reels/Stories) = terrible user experience<br/>
                          FIX: Film vertical (9:16) for Stories/Reels, square or horizontal for feed posts
                        </p>
                      </li>
                      <li>
                        <strong>🙏 Engagement Bait</strong>
                        <p className="text-sm ml-6 mt-1 text-slate-600">
                          WHY: "Comment 'YES' if you want a discount" → Facebook (Meta) explicitly hides these posts<br/>
                          FIX: Ask genuine questions instead. "What's your biggest AC headache?" vs "Like if you agree!"
                        </p>
                      </li>
                      <li>
                        <strong>🔗 Broken Links</strong>
                        <p className="text-sm ml-6 mt-1 text-slate-600">
                          WHY: Linking to a website that loads slowly = bad user experience → algorithm penalizes<br/>
                          FIX: Test your links before posting. Ensure your website loads in under 3 seconds
                        </p>
                      </li>
                      <li>
                        <strong>🗑️ Deleted Posts</strong>
                        <p className="text-sm ml-6 mt-1 text-slate-600">
                          WHY: Deleting and reposting the same thing confuses the AI → looks like spam<br/>
                          FIX: Edit posts instead of deleting. If you must delete, wait 24+ hours before reposting
                        </p>
                      </li>
                      <li>
                        <strong>🕐 Slow Response Time</strong>
                        <p className="text-sm ml-6 mt-1 text-slate-600">
                          WHY: Taking 24+ hours to reply to a comment signals "inactive account"<br/>
                          FIX: Respond within 1 hour when possible. The faster you reply, the more the algorithm rewards you
                        </p>
                      </li>
                      <li>
                        <strong>🏷️ Over-Tagging</strong>
                        <p className="text-sm ml-6 mt-1 text-slate-600">
                          WHY: Tagging 20 people who don't interact with the post = spam behavior<br/>
                          FIX: Only tag people who are genuinely relevant and likely to engage
                        </p>
                      </li>
                      <li>
                        <strong>🤖 Automated Bot Comments</strong>
                        <p className="text-sm ml-6 mt-1 text-slate-600">
                          WHY: Using "fake" engagement tools gets your account flagged instantly<br/>
                          FIX: NEVER use bots or engagement pods. Platforms detect and severely punish this
                        </p>
                      </li>
                      <li>
                        <strong>📍 No Location Tag</strong>
                        <p className="text-sm ml-6 mt-1 text-slate-600">
                          WHY: Posting without telling the algorithm where the job happened = missed local visibility<br/>
                          FIX: ALWAYS add a location tag. This helps you show up in "near me" searches!
                        </p>
                      </li>
                    </ul>
                  </details>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                  <strong className="text-green-800 text-lg">🏆 How to Win the Algorithm:</strong>
                  <ul className="list-none ml-2 mt-3 text-slate-700 space-y-2">
                    <li>📅 <strong>Post consistently</strong> - 3-5x per week minimum (use the tools in this suite!)</li>
                    <li>📸 <strong>Use real job photos</strong> - algorithms prioritize authentic content over stock images</li>
                    <li>📖 <strong>Tell stories</strong> - "We fixed this homeowner's problem" beats "We do [service]"</li>
                    <li>💬 <strong>Respond to comments</strong> - shows the platform your content creates conversation</li>
                    <li>⏰ <strong>Post when audience is active</strong> - Evenings (6-9pm) and weekends for homeowners</li>
                  </ul>
                </div>
              </div>

              {/* Platform-Specific Algorithm Strategies */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-500 rounded-xl p-6">
                <h4 className="font-bold text-2xl text-purple-800 mb-4">🎯 Platform-Specific Algorithm Strategies</h4>
                <p className="text-slate-700 mb-4 text-lg">
                  Each platform has its own algorithm with unique ranking factors. Master these to dominate each platform!
                </p>

                {/* Facebook Algorithm */}
                <details className="bg-white border-2 border-blue-500 rounded-xl p-5 mb-3">
                  <summary className="font-bold text-lg text-blue-900 cursor-pointer hover:text-blue-700">
                    📘 Facebook (Meta) Algorithm Deep Dive <span className="text-sm font-normal italic">(Click to expand)</span>
                  </summary>
                  <div className="mt-4 space-y-3">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <strong className="text-green-700">✅ What Counts (Facebook-Specific):</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• <strong>Saves</strong> - Highest value! Shows content is valuable enough to keep</li>
                        <li>• <strong>Meaningful interactions</strong> - Comments (weighted higher than likes), shares, reactions</li>
                        <li>• <strong>Watch time</strong> - Videos watched 50%+ get massive boost</li>
                        <li>• <strong>Click-through rate</strong> - People clicking "See More" or links shows interest</li>
                        <li>• <strong>First hour engagement</strong> - Initial velocity determines if post goes viral</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <strong className="text-red-700">❌ What KILLS Reach (Facebook-Specific):</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• <strong>Engagement bait</strong> - "Tag a friend", "Like if you agree", "Share for good luck" = instant penalty</li>
                        <li>• <strong>Too many links</strong> - Facebook wants users on platform, external links get buried</li>
                        <li>• <strong>Low-quality images</strong> - Pixelated, text-heavy graphics, memes</li>
                        <li>• <strong>Posting too frequently</strong> - More than 2x/day = spam signal</li>
                        <li>• <strong>Copy-paste content</strong> - Same post across multiple groups detected and penalized</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <strong className="text-blue-700">🏆 How to Win Facebook Algorithm:</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• Post 3-5x per week (consistency > frequency)</li>
                        <li>• Use before/after photos (high save rate)</li>
                        <li>• Respond to EVERY comment within 1 hour of posting</li>
                        <li>• Ask questions in captions (drives comments without being "bait")</li>
                        <li>• Share to Story immediately after posting to feed</li>
                        <li>• Post 6-9pm when homeowners are scrolling</li>
                      </ul>
                    </div>
                  </div>
                </details>

                {/* GBP Algorithm */}
                <details className="bg-white border-2 border-red-500 rounded-xl p-5 mb-3">
                  <summary className="font-bold text-lg text-red-900 cursor-pointer hover:text-red-700">
                    📍 Google Business Profile Algorithm (Local SEO) <span className="text-sm font-normal italic">(Click to expand)</span>
                  </summary>
                  <div className="mt-4 space-y-3">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <strong className="text-green-700">✅ What Counts (GBP-Specific):</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• <strong>Review quantity + recency</strong> - More recent reviews = higher rankings</li>
                        <li>• <strong>Review response rate</strong> - Responding to all reviews signals active business</li>
                        <li>• <strong>Post frequency</strong> - Posting 2x/week minimum keeps profile "fresh"</li>
                        <li>• <strong>Q&A activity</strong> - Answering questions shows expertise + keeps listing updated</li>
                        <li>• <strong>Photo uploads</strong> - 5+ photos/month shows active, current business</li>
                        <li>• <strong>User actions</strong> - Calls, direction requests, website clicks = strong ranking signals</li>
                        <li>• <strong>Profile completeness</strong> - 100% complete profiles rank higher</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <strong className="text-red-700">❌ What KILLS Rankings (GBP-Specific):</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• <strong>Keyword stuffing</strong> - Business name like "Joe's Plumbing Best Plumber Philadelphia" = penalty</li>
                        <li>• <strong>Fake reviews</strong> - Google AI detects patterns, can delist your business</li>
                        <li>• <strong>Incomplete profile</strong> - Missing hours, phone, services = lower rankings</li>
                        <li>• <strong>Slow review responses</strong> - Not responding or responding weeks later</li>
                        <li>• <strong>Duplicate listings</strong> - Multiple GBP listings for same business confuses algorithm</li>
                        <li>• <strong>Wrong category</strong> - Mismatched primary category hurts relevance</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <strong className="text-red-700">🏆 How to Win GBP Algorithm:</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• Get 5+ reviews per month (ask every happy customer!)</li>
                        <li>• Respond to ALL reviews within 24 hours</li>
                        <li>• Post 2x per week minimum (use content tools!)</li>
                        <li>• Upload 5+ geotagged photos per month</li>
                        <li>• Seed Q&A section with 10 questions you answer yourself</li>
                        <li>• Keep hours updated (especially holidays)</li>
                        <li>• Use all 10 service categories Google allows</li>
                      </ul>
                    </div>
                  </div>
                </details>

                {/* Nextdoor Algorithm */}
                <details className="bg-white border-2 border-green-500 rounded-xl p-5 mb-3">
                  <summary className="font-bold text-lg text-green-900 cursor-pointer hover:text-green-700">
                    🏘️ Nextdoor Algorithm Deep Dive <span className="text-sm font-normal italic">(Click to expand)</span>
                  </summary>
                  <div className="mt-4 space-y-3">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <strong className="text-green-700">✅ What Counts (Nextdoor-Specific):</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• <strong>Neighbor recommendations</strong> - Public recommendations are GOLD</li>
                        <li>• <strong>"Helpful" votes</strong> - Comments marked helpful boost visibility</li>
                        <li>• <strong>Reply engagement</strong> - Responding to comments/questions</li>
                        <li>• <strong>Service area size</strong> - More neighborhoods = more visibility</li>
                        <li>• <strong>Verification status</strong> - Verified businesses rank higher</li>
                        <li>• <strong>Being helpful</strong> - Answering neighbor questions (even non-sales) builds trust</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <strong className="text-red-700">❌ What KILLS Visibility (Nextdoor-Specific):</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• <strong>Being overly salesy</strong> - Every post = sales pitch gets flagged/hidden</li>
                        <li>• <strong>Posting too frequently</strong> - More than 1x/week feels spammy to neighbors</li>
                        <li>• <strong>Ignoring questions</strong> - Not responding to comments signals poor service</li>
                        <li>• <strong>Getting flagged</strong> - Neighbors can flag spam, reduces visibility</li>
                        <li>• <strong>Copy-paste content</strong> - Generic posts feel corporate, not neighborly</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <strong className="text-green-700">🏆 How to Win Nextdoor Algorithm:</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• Be helpful FIRST - answer questions even when not selling</li>
                        <li>• Use keyword alerts - respond to emergency posts within 10 min</li>
                        <li>• Get verified for recommendations</li>
                        <li>• Expand service areas to all neighborhoods you serve</li>
                        <li>• Post seasonal tips (not sales) - "5 ways to prevent frozen pipes" / "3 signs your roof needs winter prep"</li>
                        <li>• Thank every recommendation publicly</li>
                        <li>• Limit sales posts to 1x every 2-3 weeks</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 mt-3">
                      <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> During a storm or heatwave, don't just post. Use the <strong>⚡ Weather Alert Urgency Posts</strong> tool. Nextdoor's algorithm prioritizes "Safety and Urgency" content. Posting a weather tip during a local alert can get you <strong>10x more impressions</strong> than a standard service post.</p>
                    </div>
                  </div>
                </details>

                {/* Yelp Algorithm */}
                <details className="bg-white border-2 border-yellow-500 rounded-xl p-5 mb-3">
                  <summary className="font-bold text-lg text-yellow-900 cursor-pointer hover:text-yellow-700">
                    ⭐ Yelp Algorithm Deep Dive <span className="text-sm font-normal italic">(Click to expand)</span>
                  </summary>
                  <div className="mt-4 space-y-3">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <strong className="text-green-700">✅ What Counts (Yelp-Specific):</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• <strong>Review count</strong> - More reviews = higher search rankings</li>
                        <li>• <strong>Review recency</strong> - Recent reviews (last 30 days) weighted heavily</li>
                        <li>• <strong>Review response rate</strong> - Responding to all reviews boosts credibility</li>
                        <li>• <strong>Profile completeness</strong> - 100% complete profiles rank higher</li>
                        <li>• <strong>Photo count</strong> - 10+ photos shows active business</li>
                        <li>• <strong>Check-ins</strong> - Customer check-ins = engagement signal</li>
                        <li>• <strong>Elite reviewer attention</strong> - Reviews from Elite Yelpers carry more weight</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <strong className="text-red-700">❌ What KILLS Rankings (Yelp-Specific):</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• <strong>Asking for reviews</strong> - Against Yelp TOS, can filter legitimate reviews</li>
                        <li>• <strong>Fake reviews</strong> - Yelp's filter catches these, can ban your listing</li>
                        <li>• <strong>Ignoring negative reviews</strong> - Not responding looks unprofessional</li>
                        <li>• <strong>Incomplete profile</strong> - Missing hours, photos, services</li>
                        <li>• <strong>Paying for reviews</strong> - Detected and penalized severely</li>
                        <li>• <strong>Review gating</strong> - Only sending happy customers to Yelp (filter detects this)</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <strong className="text-yellow-700">🏆 How to Win Yelp Algorithm:</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• Complete 100% of profile (every field matters)</li>
                        <li>• Upload 10+ high-quality job photos</li>
                        <li>• Respond to ALL reviews (positive + negative) within 24 hours</li>
                        <li>• Update hours immediately when they change</li>
                        <li>• Add seasonal hours for holidays</li>
                        <li>• NEVER ask for reviews - let them come naturally</li>
                        <li>• Monitor for questions and respond quickly</li>
                        <li>• Keep services list current and detailed</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 mt-3">
                      <strong className="text-blue-700">📲 The Apple Maps Multiplier:</strong>
                      <p className="ml-4 mt-2 text-sm text-blue-800">
                        Yelp is the engine for <strong>Apple Maps.</strong> High engagement on your Yelp profile (photos and responses)
                        directly improves how high your "pin" appears when an iPhone user asks Siri for a <strong>[Service] near them.</strong>
                      </p>
                      <p className="ml-4 mt-2 text-sm text-blue-700 italic">
                        💡 60%+ of smartphone users have iPhones. Dominate Yelp = dominate every "Hey Siri, find a [your trade] near me" search!
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500 mt-3">
                      <p className="text-purple-800 text-sm"><strong>🔗 DIRECT LINK:</strong> Don't rely solely on Yelp. Claim your "Business Place Card" directly at <a href="https://businessconnect.apple.com" target="_blank" className="text-blue-600 underline font-bold">businessconnect.apple.com</a>. This ensures your "Call Now" button works flawlessly with Siri and Apple CarPlay.</p>
                    </div>
                  </div>
                </details>

                {/* Website SEO Algorithm */}
                <details className="bg-white border-2 border-indigo-500 rounded-xl p-5 mb-3">
                  <summary className="font-bold text-lg text-indigo-900 cursor-pointer hover:text-indigo-700">
                    🔍 Website SEO Algorithm Deep Dive <span className="text-sm font-normal italic">(Click to expand)</span>
                  </summary>
                  <div className="mt-4 space-y-3">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <strong className="text-green-700">✅ What Counts (SEO-Specific):</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• <strong>Keywords in titles/headers</strong> - "Plumber in Philadelphia" in H1 tag</li>
                        <li>• <strong>NAP consistency</strong> - Name, Address, Phone match across all platforms</li>
                        <li>• <strong>Local backlinks</strong> - Links from local chamber, news, directories</li>
                        <li>• <strong>Page speed</strong> - Fast loading (under 3 sec) = higher rankings</li>
                        <li>• <strong>Mobile-friendly</strong> - 60% of searches are mobile, must be responsive</li>
                        <li>• <strong>Fresh content</strong> - Blogging 2x/month signals active site</li>
                        <li>• <strong>Schema markup</strong> - Structured data helps Google understand your business</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <strong className="text-red-700">❌ What KILLS Rankings (SEO-Specific):</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• <strong>Duplicate content</strong> - Copy-paste from competitors or your own pages</li>
                        <li>• <strong>Slow load times</strong> - 5+ seconds = users bounce, Google penalizes</li>
                        <li>• <strong>Not mobile-optimized</strong> - Unreadable on phones = penalty</li>
                        <li>• <strong>Keyword stuffing</strong> - "Plumber plumbing plumber Philadelphia plumber" = spam</li>
                        <li>• <strong>Broken links</strong> - 404 errors signal unmaintained site</li>
                        <li>• <strong>NAP inconsistency</strong> - Different phone/address on different platforms</li>
                        <li>• <strong>No HTTPS</strong> - Unsecure sites get penalized</li>
                      </ul>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <strong className="text-indigo-700">🏆 How to Win SEO Algorithm:</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• Blog 2x per month on local topics ("Top 5 HVAC Issues in Philadelphia Winter")</li>
                        <li>• Optimize all page titles with city + service</li>
                        <li>• Ensure NAP is IDENTICAL on website, GBP, Yelp, Facebook</li>
                        <li>• Get site speed under 3 seconds (use free Google PageSpeed tool)</li>
                        <li>• Make site mobile-friendly (test with Google Mobile-Friendly Test)</li>
                        <li>• Get listed in local directories (Chamber of Commerce, Angi, HomeAdvisor)</li>
                        <li>• Add schema markup (use free schema generator tools)</li>
                      </ul>
                    </div>
                  </div>
                </details>
              </div>

              {/* Follower Growth Tactics */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-500 rounded-xl p-6">
                <h4 className="font-bold text-2xl text-blue-800 mb-4">📈 Follower Growth Tactics (Facebook)</h4>
                <p className="text-slate-700 mb-4 text-lg">
                  More followers = more reach for every post! Only Facebook has "followers" for business pages (GBP, Yelp, Nextdoor are search/neighborhood-based). Here's how to grow your Facebook following organically.
                </p>

                <div className="bg-white p-4 rounded-lg mb-4">
                  <strong className="text-blue-700 text-lg">🎯 5 Proven Follower Growth Tactics:</strong>
                  <div className="space-y-4 mt-3">
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-600">
                      <strong className="text-blue-900">1. Personal Profile → Business Page Funnel (BEST TACTIC!)</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• Send 20-30 friend requests/week from YOUR personal profile</li>
                        <li>• Target: Local homeowners (check mutual friends, local groups, your city)</li>
                        <li>• Once they accept, invite them to like your business page</li>
                        <li>• Facebook: Go to your business page → Click "Invite Friends" → Select all</li>
                        <li>• <strong className="text-green-700">Result: 50-100+ new followers per month for FREE</strong></li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-600">
                      <strong className="text-blue-900">2. Share Business Page in Local Facebook Groups</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• Join 5-10 local groups ("Homeowners of [City]", "[City] Buy/Sell/Trade", "[City] Recommendations")</li>
                        <li>• When someone asks for service recommendations, comment with helpful info + mention your page</li>
                        <li>• Share valuable tips occasionally (not sales posts) with "Follow our page for more tips!"</li>
                        <li>• <strong className="text-orange-700">⚠️ Don't spam - be genuinely helpful or you'll get banned</strong></li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-600">
                      <strong className="text-blue-900">3. Invite Every Customer to Like Your Page</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• After job completion: "Hey, would you mind liking our Facebook page? It really helps us out!"</li>
                        <li>• Include page link in your email signature</li>
                        <li>• Add "Follow us on Facebook!" to invoices/receipts</li>
                        <li>• <strong className="text-green-700">Conversion rate: 30-50% of happy customers will like your page</strong></li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-600">
                      <strong className="text-blue-900">4. Cross-Promote on Other Platforms</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• Add "Follow us on Facebook" to Google Business Profile posts</li>
                        <li>• Include Facebook link in Yelp business description</li>
                        <li>• Mention in Nextdoor bio and posts</li>
                        <li>• Add to website footer and blog posts</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-600">
                      <strong className="text-blue-900">5. Run Cheap "Like Page" Ads (Optional)</strong>
                      <ul className="ml-4 mt-2 text-sm space-y-1">
                        <li>• Budget: $1-2/day = $30-60/month</li>
                        <li>• Target: Homeowners within 15 miles, ages 30-65</li>
                        <li>• Result: 50-100 new followers/month</li>
                        <li>• <strong className="text-orange-700">⚠️ Organic tactics above are FREE and often work better!</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-600">
                  <strong className="text-blue-900">📊 Weekly Target: +10-20 new followers</strong>
                  <p className="text-blue-800 text-sm mt-2">
                    Tactics 1-3 combined = 50-100+ new followers per month organically. More followers = every post reaches more people = more calls and bookings!
                  </p>
                </div>
              </div>

              {/* Content Types That Algorithm LOVES */}
              <div className="bg-cyan-50 border-2 border-cyan-500 rounded-xl p-6">
                <h4 className="font-bold text-2xl text-cyan-800 mb-4">🎯 Content Types That Algorithm LOVES</h4>
                <p className="text-slate-700 mb-4 text-lg">
                  Not all content is equal. Some formats get 10x more reach than others. Use these proven winners.
                </p>
                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div>
                    <strong className="text-cyan-700 text-lg">📸 Before/After Photos (HIGHEST engagement!)</strong>
                    <p className="text-base ml-6 mt-2 text-slate-600">
                      Why it works: People LOVE transformations. It's visual proof of your work.<br/>
                      How to post: Use carousel format (5 slides) on Facebook or multi-image post on Google Business Profile<br/>
                      Pro tip: Take BOTH before AND after photos on EVERY job. Even small jobs look impressive when you show the transformation.<br/>
                      Engagement boost: 3-5x more likes/shares than text posts
                    </p>
                  </div>
                  <div>
                    <strong className="text-cyan-700 text-lg">🎬 Short Videos (60 seconds or less)</strong>
                    <p className="text-base ml-6 mt-2 text-slate-600">
                      Why it works: Video gets 10x more reach than text. Algorithms HEAVILY favor video content.<br/>
                      Platforms: Facebook video, Google Business Profile, Nextdoor, embedded on Website<br/>
                      Don't overthink it: Simple phone videos work! Show your process, explain what you're fixing, film the before/after.<br/>
                      Script it: Use the Video Script tool in this suite - gives you second-by-second directions
                    </p>
                  </div>
                  <div>
                    <strong className="text-cyan-700 text-lg">💬 Story-Based Posts (Not service lists!)</strong>
                    <p className="text-base ml-6 mt-2 text-slate-600">
                      ❌ Bad: "We do plumbing, HVAC, and electrical work. Call us!"<br/>
                      ✅ Good: "Just helped a neighbor on Oak Street avoid a $8,000 flood. Here's what we found..."<br/>
                      Why it works: Stories are relatable. "We just helped your neighbor" beats "We offer services."<br/>
                      Formula: Problem you found → How you fixed it → Result/savings → CTA
                    </p>
                  </div>
                  <div>
                    <strong className="text-cyan-700 text-lg">⚠️ Educational Tips (SAVES are gold!)</strong>
                    <p className="text-base ml-6 mt-2 text-slate-600">
                      Example: "3 signs your roof needs attention before winter"<br/>
                      Why it works: People SAVE helpful content to reference later. Saves are the highest-value engagement signal.<br/>
                      Formula: "X warning signs of [problem]" or "How to prevent [expensive problem]"<br/>
                      Post these on Monday/Tuesday - people save educational content early in the week
                    </p>
                  </div>
                  <div>
                    <strong className="text-cyan-700 text-lg">🏘️ Neighborhood-Specific Posts</strong>
                    <p className="text-base ml-6 mt-2 text-slate-600">
                      Example: "Just completed a furnace replacement in Camp Hill..."<br/>
                      Why it works: Hyperlocal content gets shared in neighborhood groups. "Hey that's MY street!" factor.<br/>
                      Where to post: Nextdoor (HUGE for this), Facebook neighborhood groups<br/>
                      Pro tip: Tag the specific neighborhood, not just the city
                    </p>
                  </div>
                </div>
              </div>

              {/* Hashtag Strategy */}
              <div className="bg-indigo-50 border-2 border-indigo-500 rounded-xl p-6">
                <h4 className="font-bold text-2xl text-indigo-800 mb-4">🏷️ Smart Hashtag Strategy (3-5 per post)</h4>
                <p className="text-slate-700 mb-4 text-lg">
                  Hashtags help new people DISCOVER your content. But more ≠ better! Using 30 hashtags makes you look like spam.
                  Use 3-5 strategic, relevant hashtags per post.
                </p>
                <div className="bg-white p-4 rounded-lg">
                  <strong className="text-indigo-700 text-lg">🎯 The 5-Hashtag Formula for Home Services:</strong>
                  <ul className="list-none ml-2 mt-3 text-slate-700 space-y-3">
                    <li>
                      <strong>1️⃣ Service Hashtag</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        What you DO: #PlumbingRepair #HVACService #RoofingContractor #ElectricalWork<br/>
                        Use the EXACT service you're posting about, not just "plumbing"
                      </p>
                    </li>
                    <li>
                      <strong>2️⃣ Location Hashtag</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        WHERE you serve: #HarrisburgPA #CampHillHomes #CentralPA #YorkCounty<br/>
                        Use city AND neighborhood tags - hyperlocal wins for home services<br/>
                        Create your own: #CampHillPlumber #HarrisburgHVAC
                      </p>
                    </li>
                    <li>
                      <strong>3️⃣ Problem Hashtag</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        What PROBLEM you solved: #WaterDamage #ACRepair #LeakyRoof #BrokenPipe<br/>
                        People search for problems, not services - "my AC broke" not "HVAC contractor"
                      </p>
                    </li>
                    <li>
                      <strong>4️⃣ Audience Hashtag</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        WHO you serve: #Homeowners #PropertyManagement #SmallBusiness #Landlords<br/>
                        Match this to your target market selection in the tools
                      </p>
                    </li>
                    <li>
                      <strong>5️⃣ Outcome Hashtag</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        What RESULT you delivered: #HomeValue #EnergySavings #PropertyProtection #CostSavings<br/>
                        Focus on benefits, not features
                      </p>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <p className="text-red-900 text-sm">
                      <strong>❌ Avoid These Spam Hashtags:</strong> #FollowForFollow #LikeForLike #InstaGood #F4F #L4L<br/>
                      Platforms flag these as spam signals and REDUCE your reach
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Wins */}
              <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-6">
                <h4 className="font-bold text-2xl text-yellow-800 mb-4">⚡ Quick Wins (Do These RIGHT NOW!)</h4>
                <p className="text-slate-700 mb-4 text-lg">
                  These take less than 10 minutes total and will immediately boost your visibility.
                </p>
                <div className="bg-white p-4 rounded-lg">
                  <ul className="list-none space-y-3 text-slate-700">
                    <li className="text-base">
                      <strong>✅ Turn on post notifications for your business page</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        Facebook: Settings → Notifications → All Posts On<br/>
                        Google Business: Enable notifications in the GBP app<br/>
                        Why: You'll get instant alerts when people comment - respond within minutes to boost engagement
                      </p>
                    </li>
                    <li className="text-base">
                      <strong>✅ Take before photos on EVERY job starting today</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        Before you touch anything, take 3-5 photos from different angles<br/>
                        Why: Building your content library NOW means you'll never run out of posts
                      </p>
                    </li>
                    <li className="text-base">
                      <strong>✅ Ask your last happy customer if they'd be featured in a post</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        Text them: "Mind if we share a quick post about your [job]? Great for our portfolio!"<br/>
                        Why: Customer stories get 2-3x more engagement than generic posts
                      </p>
                    </li>
                    <li className="text-base">
                      <strong>✅ Use the "Week of Content" tool for your last completed job</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        Takes 2 minutes to fill out → generates 7 platform-specific posts<br/>
                        Why: You'll have content for the entire week in one tool use
                      </p>
                    </li>
                    <li className="text-base">
                      <strong>✅ Schedule posts for 6-8pm</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        Use Facebook's built-in scheduler (free!) or schedule directly on Google Business Profile<br/>
                        Why: Homeowners scroll after work - posting at peak times = more reach
                      </p>
                    </li>
                    <li className="text-base">
                      <strong>✅ Add your city name to your Facebook "About" section</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        Page Settings → About → Add "Serving [Your City] since [Year]"<br/>
                        Why: Local SEO boost - helps you appear in "[Service] near me" searches
                      </p>
                    </li>
                    <li className="text-base">
                      <strong>✅ Respond to EVERY review within 24 hours</strong>
                      <p className="text-sm ml-6 mt-1 text-slate-600">
                        Google reviews: Most important for local SEO<br/>
                        Facebook/Yelp/Nextdoor: Builds trust with potential customers<br/>
                        Thank positive reviews (2-3 sentences), address negative reviews professionally (acknowledge + solution)<br/>
                        Why: Response rate affects your rankings on Google & Yelp + shows you care about customers. Platforms track this and reward active businesses!
                      </p>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

            {/* How to Get More Reviews */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-500 rounded-xl p-6 mt-6">
              <h4 className="font-bold text-2xl text-rose-800 mb-4">💬 How to Get More Reviews (The Right Way)</h4>
              <p className="text-slate-700 mb-4 text-lg">
                Reviews = trust = more customers. But you need the RIGHT reviews on the RIGHT platforms. Here's exactly how to ask.
              </p>

              {/* Priority Ranking */}
              <div className="bg-white p-4 rounded-lg mb-4 border-l-4 border-rose-600">
                <strong className="text-rose-700 text-lg">🎯 Priority Ranking (Where to Focus Your Energy):</strong>
                <div className="space-y-3 mt-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <strong className="text-green-700">1. Google Business Profile (80% of your effort here!)</strong>
                    <p className="text-sm text-slate-600 mt-1">
                      <strong>Why #1:</strong> Google reviews boost local SEO rankings + appear in search results + most trusted by customers<br/>
                      <strong>Target:</strong> 5+ new reviews per month (ask EVERY happy customer)
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <strong className="text-blue-700">2. Facebook (15% of effort)</strong>
                    <p className="text-sm text-slate-600 mt-1">
                      <strong>Why #2:</strong> Social proof on your business page, easy for customers (they're already on Facebook)<br/>
                      <strong>Target:</strong> 2-3 new reviews per month
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <strong className="text-purple-700">3. Nextdoor Recommendations (5% of effort)</strong>
                    <p className="text-sm text-slate-600 mt-1">
                      <strong>Why #3:</strong> Recommendations (not reviews) are hyperlocal social proof - neighbors trust neighbors<br/>
                      <strong>Target:</strong> 1-2 recommendations per month
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-500">
                    <strong className="text-yellow-700">4. Yelp (0% ACTIVE effort - NEVER ASK DIRECTLY!)</strong>
                    <p className="text-sm text-slate-600 mt-1">
                      <strong>Why last:</strong> Asking for Yelp reviews violates their Terms of Service = they filter/remove reviews<br/>
                      <strong>Strategy:</strong> Provide great service, make it easy to find you on Yelp, let reviews come naturally
                    </p>
                  </div>
                </div>
              </div>

              {/* Deep Links - Find Your Review Links */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg mb-4 border-2 border-indigo-500">
                <strong className="text-indigo-700 text-lg">🔗 Deep Links (Find Your Review URLs Instantly):</strong>
                <div className="space-y-2 mt-3">
                  <div className="bg-white p-2 rounded">
                    <p className="text-sm text-slate-700"><strong>📍 Google Review Link:</strong> Go to <a href="https://business.google.com" target="_blank" className="text-blue-600 underline">business.google.com</a> → Your Profile → "Get more reviews" button → Copy the short link</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="text-sm text-slate-700"><strong>📘 Facebook Review Link:</strong> <code className="bg-slate-100 px-1 rounded">facebook.com/[YourPageName]/reviews</code> (replace with your actual page name)</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="text-sm text-slate-700"><strong>🏘️ Nextdoor Business Page:</strong> <a href="https://nextdoor.com/create-business" target="_blank" className="text-blue-600 underline">nextdoor.com/create-business</a> (claim or create your business profile)</p>
                  </div>
                </div>
                <p className="text-xs text-indigo-600 mt-2 italic">💡 Pro Tip: Save these links in your phone's Notes app for instant copy-paste when asking for reviews!</p>
              </div>

              {/* When to Ask */}
              <div className="bg-white p-4 rounded-lg mb-4">
                <strong className="text-rose-700 text-lg">⏰ Timing is EVERYTHING (When to Ask):</strong>
                <ul className="list-none ml-2 mt-3 text-slate-700 space-y-3">
                  <li>
                    <strong className="text-green-700">🏆 BEST: Within 1 hour of job completion</strong>
                    <p className="text-sm ml-6 mt-1 text-slate-600">
                      Customer is impressed, details fresh, still on-site or just left<br/>
                      Method: In-person ask + immediate follow-up text with link
                    </p>
                  </li>
                  <li>
                    <strong className="text-blue-700">✅ GOOD: Same day (within 8 hours)</strong>
                    <p className="text-sm ml-6 mt-1 text-slate-600">
                      Send follow-up text or email with review link<br/>
                      Customer still remembers the experience clearly
                    </p>
                  </li>
                  <li>
                    <strong className="text-yellow-700">⚠️ OKAY: Within 24 hours</strong>
                    <p className="text-sm ml-6 mt-1 text-slate-600">
                      Email via Job Pipeline tool (Asset #3)<br/>
                      Customer starting to forget details, but still reasonable
                    </p>
                  </li>
                  <li>
                    <strong className="text-red-700">❌ TOO LATE: 3+ days later</strong>
                    <p className="text-sm ml-6 mt-1 text-slate-600">
                      Customer has moved on, details fuzzy, unlikely to leave review<br/>
                      Response rate drops from 40% to under 10%
                    </p>
                  </li>
                </ul>
              </div>

              {/* How to Ask - Scripts */}
              <div className="bg-white p-4 rounded-lg mb-4">
                <strong className="text-rose-700 text-lg">💬 How to Ask (Exact Scripts):</strong>

                <div className="space-y-4 mt-3">
                  {/* In-Person Script */}
                  <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-600">
                    <strong className="text-green-700">🗣️ In-Person Script (As You're Finishing Up):</strong>
                    <p className="text-sm bg-white p-3 rounded mt-2 italic text-slate-800">
                      "I'm so glad we could fix that for you! Quick favor - would you mind leaving us a review on Google?
                      It really helps other homeowners find us. I'll text you the link right now - takes 30 seconds!"
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      <strong>💡 Pro Tip:</strong> Pull out your phone while asking, shows you'll make it easy for them right now
                    </p>
                  </div>

                  {/* Text Message Template */}
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-600">
                    <strong className="text-blue-700">📱 Text Message Template (Send Within 1 Hour):</strong>
                    <p className="text-sm bg-white p-3 rounded mt-2 text-slate-800">
                      "Hi [Name]! Thanks again for your business today. Quick favor - would you leave us a Google review?
                      Just tap here: [Your Google Review Link]<br/><br/>
                      Takes 30 seconds and really helps us out. Thanks! - [Your Name]"
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      <strong>💡 How to get your Google review link:</strong> Google Business Profile → Get more reviews → Copy short link
                    </p>
                  </div>

                  {/* Email Template */}
                  <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-600">
                    <strong className="text-purple-700">📧 Email Template (Use Job Pipeline Tool):</strong>
                    <p className="text-sm text-slate-700 mt-2">
                      The <strong>Job Pipeline</strong> tool (in this suite!) generates "Asset #3: Review Request Email" automatically!<br/>
                      It includes links to Google, Facebook, and general review request
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      <strong>💡 Pro Tip:</strong> Email is slower than text (lower response rate), but still worth sending within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* What NOT to Do */}
              <div className="bg-red-50 p-4 rounded-lg mb-4 border-2 border-red-500">
                <strong className="text-red-700 text-lg">🚫 What NOT to Do (These Will Backfire!):</strong>
                <ul className="list-none ml-2 mt-3 text-slate-700 space-y-3">
                  <li>
                    <strong className="text-red-700">❌ Never ask for "5-star" review specifically</strong>
                    <p className="text-sm ml-6 mt-1 text-slate-600">
                      Platforms detect this as review manipulation<br/>
                      Just ask for "a review" or "honest feedback"
                    </p>
                  </li>
                  <li>
                    <strong className="text-red-700">❌ NEVER ask for Yelp reviews directly</strong>
                    <p className="text-sm ml-6 mt-1 text-slate-600">
                      Violates Yelp Terms of Service - they filter/remove reviews from asked customers<br/>
                      Yelp uses AI to detect solicited reviews - don't risk it!
                    </p>
                  </li>
                  <li>
                    <strong className="text-red-700">❌ Never offer incentives or discounts for reviews</strong>
                    <p className="text-sm ml-6 mt-1 text-slate-600">
                      Against Google/Facebook/Yelp policies = reviews removed + potential account penalties<br/>
                      "Leave a review and get 10% off next service" = banned on all platforms
                    </p>
                  </li>
                  <li>
                    <strong className="text-red-700">❌ Never "review gate" (only send happy customers to Google)</strong>
                    <p className="text-sm ml-6 mt-1 text-slate-600">
                      Asking "How'd we do?" first, then only sending satisfied customers to Google = manipulation<br/>
                      Platforms detect unnatural 100% positive review patterns
                    </p>
                  </li>
                  <li>
                    <strong className="text-red-700">❌ Never use review stations/tablets at job site</strong>
                    <p className="text-sm ml-6 mt-1 text-slate-600">
                      Google detects reviews from same IP/device = flags as fake<br/>
                      Let customers review from their own device in their own time
                    </p>
                  </li>
                </ul>
              </div>

              {/* Making It Easy */}
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                <strong className="text-green-700 text-lg">🎯 Making It EASY for Customers (Boost Response Rate):</strong>
                <ul className="list-none ml-2 mt-3 text-slate-700 space-y-2">
                  <li>✅ <strong>Use Google's short review link</strong> (business.google.com/reviews → shorter than full URL)</li>
                  <li>✅ <strong>Text > Email</strong> (40% response rate vs 15% for email - people check texts immediately)</li>
                  <li>✅ <strong>One-tap links</strong> (mobile-friendly links that open directly to review form)</li>
                  <li>✅ <strong>Add QR code to invoice</strong> (optional - scans directly to review page)</li>
                  <li>✅ <strong>Ask in person first</strong> (shows confidence, gets verbal yes, then follow up with link)</li>
                  <li>✅ <strong>Keep it short</strong> ("30 seconds" sounds fast, "leave a review" sounds long)</li>
                </ul>
              </div>

              {/* The 80/20 Rule Summary */}
              <div className="bg-rose-100 p-4 rounded-lg border-2 border-rose-500">
                <p className="text-rose-900 font-bold text-lg">📊 The 80/20 Review Strategy:</p>
                <div className="text-rose-800 mt-2 space-y-1">
                  <p><strong>80% of effort:</strong> Google reviews (in-person ask + text link within 1 hour)</p>
                  <p><strong>15% of effort:</strong> Facebook reviews (Job Pipeline email tool)</p>
                  <p><strong>5% of effort:</strong> Nextdoor recommendations (casual ask: "Would you recommend us to neighbors?")</p>
                  <p><strong>0% active effort:</strong> Yelp (just provide great service, never ask directly)</p>
                  <p className="mt-3"><strong>Target:</strong> 5+ Google reviews/month = 60+ reviews/year = top rankings in your market!</p>
                </div>
              </div>
            </div>

            {/* Essential Visibility Links */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mt-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">🔗 Essential Visibility Links</h3>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>📍 Google Business Profile:</strong> <a href="https://business.google.com" target="_blank" className="text-blue-600 underline font-bold">business.google.com</a> (Manage posts, reviews, Q&A)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>📊 Facebook Page Insights:</strong> <a href="https://business.facebook.com/insights" target="_blank" className="text-blue-600 underline font-bold">business.facebook.com/insights</a> (See when your followers are online)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🍎 Apple Business Connect:</strong> <a href="https://businessconnect.apple.com" target="_blank" className="text-blue-600 underline font-bold">businessconnect.apple.com</a> (Get found by Siri & iPhone users)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🏘️ Nextdoor Business Page:</strong> <a href="https://nextdoor.com/create-business" target="_blank" className="text-blue-600 underline font-bold">nextdoor.com/create-business</a> (Claim or create your business profile)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>⭐ Yelp for Business:</strong> <a href="https://www.yelp.com/signup" target="_blank" className="text-blue-600 underline font-bold">yelp.com/signup</a> (Claim your listing — powers Apple Maps)</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-2 rounded mt-3 border-l-4 border-yellow-400">
                <p className="text-yellow-800 text-xs"><strong>💡 Quick Tip:</strong> Bookmark your Google Review short link in your phone's Notes app — you'll use it after every completed job!</p>
              </div>
            </div>

            {/* Bottom Close Button */}
            <div className="text-center">
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 text-lg">
                ✕ Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONTENT LIBRARY MODAL */}
      {activeModal === 'library' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-6xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">📚 MY CONTENT LIBRARY</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-4 flex-wrap">
              <div>
                <label className="block font-bold mb-2 text-sm">Filter by Business Type:</label>
                <select
                  value={filterBusinessType}
                  onChange={(e) => setFilterBusinessType(e.target.value)}
                  className="p-2 border-2 border-slate-300 rounded-lg"
                >
                  <option>All</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2 text-sm">Filter by Module:</label>
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="p-2 border-2 border-slate-300 rounded-lg"
                >
                  <option>All</option>
                  <option>Week of Content</option>
                  <option>Job Pipeline</option>
                  <option>30-Day Calendar</option>
                  <option>Weather Alert</option>
                  <option>Before/After Story</option>
                  <option>Video Script</option>
                  <option>Google Business Post</option>
                  <option>Competitor Intel</option>
                  <option>Review Maximizer</option>
                </select>
              </div>

              <div className="flex-1"></div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    if (confirm(`Delete ALL ${contentLibrary.length} items from your library? This cannot be undone.`)) {
                      setContentLibrary([]);
                      localStorage.removeItem('marketingContentLibrary');
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>

            {/* Library Items */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {contentLibrary.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl">
                  <p className="text-slate-500 text-lg mb-2">📭 Your library is empty</p>
                  <p className="text-slate-400">Generate content and click "💾 Save to Library" to save it here!</p>
                </div>
              ) : (
                contentLibrary
                  .filter(item => {
                    const matchesBusiness = filterBusinessType === 'All' || item.businessType === filterBusinessType;
                    const matchesModule = filterModule === 'All' || item.module === filterModule;
                    return matchesBusiness && matchesModule;
                  })
                  .map(item => (
                    <div key={item.id} className="bg-slate-50 border-2 border-slate-300 rounded-xl p-5">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-blue-600">{item.module}</h3>
                          <div className="flex gap-3 text-sm text-slate-600 mt-1">
                            <span>📅 {item.date} at {item.time}</span>
                            <span>•</span>
                            <span>🏢 {item.businessType}</span>
                            <span>•</span>
                            <span>🎯 {item.targetMarket}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteFromLibrary(item.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-red-600"
                        >
                          🗑️ Delete
                        </button>
                      </div>

                      {/* Preview */}
                      <div className="bg-white p-4 rounded-lg mb-3 text-sm text-slate-700">
                        {item.preview}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setViewingLibraryItem(item);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
                        >
                          👁️ View Full Content
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(formatForClipboard(item.content));
                            alert('✅ Content copied to clipboard!');
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  ))
              )}

              {contentLibrary.length > 0 && contentLibrary.filter(item => {
                const matchesBusiness = filterBusinessType === 'All' || item.businessType === filterBusinessType;
                const matchesModule = filterModule === 'All' || item.module === filterModule;
                return matchesBusiness && matchesModule;
              }).length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-xl">
                  <p className="text-slate-500 text-lg">🔍 No items match your filters</p>
                  <p className="text-slate-400 text-sm mt-2">Try selecting "All" in the filters above</p>
                </div>
              )}
            </div>

            {/* FULL CONTENT VIEWER OVERLAY */}
            {viewingLibraryItem && (
              <div className="fixed inset-0 bg-slate-900/90 flex items-start justify-center p-4 z-[60] overflow-y-auto" onClick={() => setViewingLibraryItem(null)}>
                <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-4xl w-full my-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b-2 border-slate-200">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{viewingLibraryItem.module}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {viewingLibraryItem.businessType} • {viewingLibraryItem.targetMarket} • Saved {viewingLibraryItem.date} at {viewingLibraryItem.time}
                      </p>
                    </div>
                    <button
                      onClick={() => setViewingLibraryItem(null)}
                      className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700 flex-shrink-0"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(formatForClipboard(viewingLibraryItem.content));
                        alert('✅ Content copied to clipboard with formatting!');
                      }}
                      className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-700 text-sm"
                    >
                      📋 Copy to Clipboard
                    </button>
                    <button
                      onClick={() => {
                        setOutput(viewingLibraryItem.content);
                        setViewingLibraryItem(null);
                        setActiveModal(null);
                      }}
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 text-sm"
                    >
                      📤 Load into Editor
                    </button>
                  </div>

                  {/* Formatted content */}
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                  }}>
                    {formatOutput(viewingLibraryItem.content)}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
      {activeModal === 'seoGuide' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-5xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">🔍 WEBSITE SEO GUIDE</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* INTRO */}
            <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-6 rounded-xl mb-6 border-2 border-orange-500">
              <h3 className="text-orange-900 font-bold text-xl mb-3">🎯 Stop Paying Agencies & Start Owning the Search Results</h3>
              <p className="text-orange-900 leading-relaxed mb-3">
                <strong>90% of SEO agencies charge $1,500/mo to do exactly what is in this guide.</strong> Follow this proven checklist to optimize your site AI Search (SGE). Includes the Landmark Hack, Schema Code, and the Answer Engine strategy.
              </p>
              <p className="text-orange-900 leading-relaxed">
                <strong>Time investment:</strong> 2-3 hours for initial setup, then ~60 minutes/month for ongoing maintenance.
                <strong>Cost:</strong> $0 (all free tools). <strong>Goal:</strong> Make your business the #1 recommendation by Siri and ChatGPT!
              </p>
            </div>

            {/* SECTION 1: QUICK WINS */}
            <details className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-4 border-2 border-green-400">
              <summary className="font-bold text-xl text-green-900 cursor-pointer mb-3">⚡ SECTION 1: Quick Wins - The "Schema" Gem (30 Minutes)</summary>
              <div className="mt-4 space-y-4 text-slate-800">
                <p className="font-semibold text-green-800">Start here! These changes take 30 minutes and deliver immediate SEO improvements:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✅</span>
                    <div>
                      <strong>Add location to ALL page titles</strong>
                      <p className="text-sm text-slate-600 mt-1">Example: Change "HVAC Repair Services" → "HVAC Repair Services in Philadelphia, PA"</p>
                      <p className="text-xs text-slate-500 mt-1">💡 Why: Google uses page titles heavily for local search rankings</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✅</span>
                    <div>
                      <strong>Write meta descriptions for all pages (150-160 characters)</strong>
                      <p className="text-sm text-slate-600 mt-1">Template: "[Service] in [City]. [Main benefit]. Call [Phone] for [unique value prop]."</p>
                      <p className="text-sm bg-slate-100 p-2 rounded mt-2 font-mono text-xs">
                        Example: "Emergency HVAC repair in Philadelphia. Same-day service, 24/7 availability. Call (215) 555-0123 for expert AC & heating repairs."
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✅</span>
                    <div>
                      <strong>Add NAP to footer of EVERY page</strong>
                      <p className="text-sm text-slate-600 mt-1">NAP = Name, Address, Phone (must be identical everywhere online)</p>
                      <p className="text-sm bg-slate-100 p-2 rounded mt-2 font-mono text-xs">
                        Smith HVAC Services<br/>
                        123 Main Street, Philadelphia, PA 19102<br/>
                        (215) 555-0123
                      </p>
                      <p className="text-xs text-slate-500 mt-1">💡 Why: Google checks NAP consistency across the web to verify legitimacy</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✅</span>
                    <div>
                      <strong>Claim your Google Business Profile</strong>
                      <p className="text-sm text-slate-600 mt-1">If not done already: Go to <a href="https://business.google.com" target="_blank" className="text-blue-600 underline">business.google.com</a> and claim your listing</p>
                      <p className="text-xs text-slate-500 mt-1">💡 Why: This is the #1 most important factor for local SEO</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✅</span>
                    <div className="w-full">
                      <strong>Add Local Business Schema Markup</strong>
                      <p className="text-sm text-slate-600 mt-1">Copy/paste this code into your website's header (replace highlighted values with your info):</p>

                      <div className="bg-red-50 p-2 rounded mt-2 border-2 border-red-400 mb-2">
                        <p className="text-red-800 text-xs font-bold">⚠️ MUST CUSTOMIZE: Replace ALL values in <span className="bg-red-200 px-1 rounded">RED HIGHLIGHTS</span> with YOUR business info. Pay special attention to the <code className="bg-red-200 px-1 rounded">areaServed</code> zip codes—these should be YOUR top 5 money-making zip codes!</p>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => {
                            const schemaCode = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Your Business Name",
  "image": "https://yoursite.com/logo.jpg",
  "telephone": "(215) 555-0123",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street",
    "addressLocality": "Philadelphia",
    "addressRegion": "PA",
    "postalCode": "19102",
    "addressCountry": "US"
  },
  "areaServed": [
    {"@type": "PostalAddress", "postalCode": "19102"},
    {"@type": "PostalAddress", "postalCode": "19103"},
    {"@type": "PostalAddress", "postalCode": "19104"},
    {"@type": "PostalAddress", "postalCode": "19106"},
    {"@type": "PostalAddress", "postalCode": "19107"}
  ],
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 39.9526,
    "longitude": -75.1652
  },
  "url": "https://yoursite.com",
  "priceRange": "$$",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "18:00"
    }
  ]
}
</script>`;
                            navigator.clipboard.writeText(schemaCode);
                            alert('✅ Schema code copied! Now paste it into your website header and customize the highlighted values.');
                          }}
                          className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold z-10"
                        >
                          📋 Copy Code
                        </button>
                        <div className="bg-slate-900 text-green-400 p-3 rounded mt-2 text-xs font-mono overflow-x-auto">
{`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",`}
  <span className="text-red-400 font-bold">{`
  "name": "Your Business Name",  ← CHANGE THIS
  "image": "https://yoursite.com/logo.jpg",  ← CHANGE THIS
  "telephone": "(215) 555-0123",  ← CHANGE THIS`}</span>{`
  "address": {
    "@type": "PostalAddress",`}
    <span className="text-red-400 font-bold">{`
    "streetAddress": "123 Main Street",  ← CHANGE THIS
    "addressLocality": "Philadelphia",  ← CHANGE THIS
    "addressRegion": "PA",  ← CHANGE THIS
    "postalCode": "19102",  ← CHANGE THIS`}</span>{`
    "addressCountry": "US"
  },`}
  <span className="text-yellow-400 font-bold bg-yellow-900/50 px-1 rounded">{`
  "areaServed": [  ← YOUR TOP 5 ZIP CODES!
    {"@type": "PostalAddress", "postalCode": "19102"},  ← CHANGE
    {"@type": "PostalAddress", "postalCode": "19103"},  ← CHANGE
    {"@type": "PostalAddress", "postalCode": "19104"},  ← CHANGE
    {"@type": "PostalAddress", "postalCode": "19106"},  ← CHANGE
    {"@type": "PostalAddress", "postalCode": "19107"}   ← CHANGE
  ],`}</span>
  <span className="text-red-400 font-bold">{`
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 39.9526,  ← CHANGE (Google your address)
    "longitude": -75.1652  ← CHANGE (Google your address)
  },
  "url": "https://yoursite.com",  ← CHANGE THIS`}</span>{`
  "priceRange": "$$",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],`}
      <span className="text-red-400 font-bold">{`
      "opens": "08:00",  ← CHANGE IF NEEDED
      "closes": "18:00"  ← CHANGE IF NEEDED`}</span>{`
    }
  ]
}
</script>`}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">💡 Tool: <a href="https://technicalseo.com/tools/schema-markup-generator/" target="_blank" className="text-blue-600 underline">Free Schema Generator</a> (if you want to build from scratch)</p>
                      <div className="bg-yellow-50 p-2 rounded mt-2 border-l-4 border-yellow-400">
                        <p className="text-xs text-yellow-800"><strong>🔥 Upgrade:</strong> The <code className="bg-yellow-200 px-1 rounded">areaServed</code> array (highlighted in yellow above) tells Google's AI exactly which zip codes you "own." List your top 5 most profitable zip codes!</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded mt-2 border-l-4 border-blue-500">
                        <p className="text-xs text-blue-800"><strong>🔧 TOOL SYNC:</strong> Not a coder? Open the <strong>❓ FAQ/Website Content Generator</strong>. It doesn't just write text; it can generate the FAQ Schema for your site. Adding this "Hidden Code" makes your business <strong>2x more likely to appear in the "People Also Ask" section</strong> of Google.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* SECTION 2: ON-PAGE SEO */}
            <details className="bg-gradient-to-r from-blue-50 to-sky-50 p-6 rounded-xl mb-4 border-2 border-blue-400">
              <summary className="font-bold text-xl text-blue-900 cursor-pointer mb-3">📄 SECTION 2: On-Page SEO - The Landmark Hack (1-2 Hours)</summary>
              <div className="mt-4 space-y-4 text-slate-800">
                <p className="font-semibold text-blue-800">Optimize the content and structure of your existing pages:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl">✅</span>
                    <div>
                      <strong>Use H1 tags properly (one per page)</strong>
                      <p className="text-sm text-slate-600 mt-1">H1 should include: Service + Location</p>
                      <p className="text-sm bg-slate-100 p-2 rounded mt-2 font-mono text-xs">
                        ✅ Good: "Emergency HVAC Repair in Philadelphia, PA"<br/>
                        ❌ Bad: "Welcome to Our Website"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl">✅</span>
                    <div>
                      <strong>Add descriptive alt text to ALL images</strong>
                      <p className="text-sm text-slate-600 mt-1">Template: "[Service/action] in [location]"</p>
                      <p className="text-sm bg-slate-100 p-2 rounded mt-2 font-mono text-xs">
                        ✅ Good: "HVAC technician repairing furnace in Philadelphia home"<br/>
                        ❌ Bad: "IMG_1234.jpg" or blank
                      </p>
                      <p className="text-xs text-slate-500 mt-1">💡 Why: Google can't "see" images - alt text tells Google what they show</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl">✅</span>
                    <div>
                      <strong>Landmark Image Optimization (The Geographic Anchor)</strong>
                      <p className="text-sm text-slate-600 mt-1">When uploading images to your site, ensure the <strong>filename</strong> includes a local landmark:</p>
                      <p className="text-sm bg-slate-100 p-2 rounded mt-2 font-mono text-xs">
                        ✅ Good: "water-damage-repair-near-central-high-school.jpg"<br/>
                        ✅ Good: "basement-flooding-fix-lower-paxton-township.jpg"<br/>
                        ❌ Bad: "IMG_1234.jpg" or "photo1.jpg"
                      </p>
                      <div className="bg-yellow-50 p-2 rounded mt-2 border-l-4 border-yellow-400">
                        <p className="text-xs text-yellow-800"><strong>🔥 Upgrade:</strong> This creates a "Geographic Anchor" that AI uses to verify your location. Google's image recognition now reads filenames to confirm you actually work in the areas you claim!</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded mt-2 border-l-4 border-blue-500">
                        <p className="text-xs text-blue-800"><strong>🔧 TOOL SYNC:</strong> Before uploading your "Landmark" images, run them through the <strong>📸 Before/After Story Generator</strong>. Use the Alt-Text it provides. AI doesn't just read filenames; it "sees" the context. Combining a landmark filename with "Solution-Oriented" alt-text is the <strong>"Double-Threat"</strong> of local SEO.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl">✅</span>
                    <div>
                      <strong>Add internal links between service pages</strong>
                      <p className="text-sm text-slate-600 mt-1">Link related services together (3-5 links per page)</p>
                      <p className="text-sm bg-slate-100 p-2 rounded mt-2">
                        Example: On "AC Repair" page, link to "Furnace Repair", "HVAC Maintenance", "Emergency Services"
                      </p>
                      <p className="text-xs text-slate-500 mt-1">💡 Why: Helps Google understand your site structure and spreads SEO value</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl">✅</span>
                    <div>
                      <strong>Create location-specific service pages</strong>
                      <p className="text-sm text-slate-600 mt-1">Make separate pages for each major service + location combo</p>
                      <p className="text-sm bg-slate-100 p-2 rounded mt-2">
                        • AC Repair in Philadelphia<br/>
                        • AC Repair in Bucks County<br/>
                        • AC Repair in Montgomery County<br/>
                        (Each has unique content about serving that area)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl">✅</span>
                    <div>
                      <strong>Optimize page load speed</strong>
                      <p className="text-sm text-slate-600 mt-1">Compress images before uploading (use <a href="https://tinypng.com" target="_blank" className="text-blue-600 underline">TinyPNG</a> - free)</p>
                      <p className="text-sm text-slate-600 mt-1">Test speed: <a href="https://pagespeed.web.dev/" target="_blank" className="text-blue-600 underline">Google PageSpeed Insights</a></p>
                      <p className="text-xs text-slate-500 mt-1">💡 Goal: Get "Good" rating (green) on mobile</p>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* SECTION 3: CONTENT STRATEGY */}
            <details className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl mb-4 border-2 border-purple-400">
              <summary className="font-bold text-xl text-purple-900 cursor-pointer mb-3">✍️ SECTION 3: Content - Answer Engine Optimization (AEO)</summary>
              <div className="mt-4 space-y-4 text-slate-800">
                <p className="font-semibold text-purple-800">Optimize your content for AI-powered search (Siri, ChatGPT, Google SGE):</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-purple-600 text-xl">✅</span>
                    <div>
                      <strong>The Answer Engine Strategy (AEO - Answer Engine Optimization)</strong>
                      <p className="text-sm text-slate-600 mt-1">Google SGE doesn't just show links; it <strong>answers questions.</strong> Your blog posts should now be titled as <strong>Questions.</strong></p>
                      <div className="bg-purple-50 p-2 rounded mt-2 border-l-4 border-purple-400">
                        <p className="text-sm text-purple-800 mb-2"><strong>❌ Old Way:</strong> "Plumbing Services Philadelphia"</p>
                        <p className="text-sm text-purple-800 mb-2"><strong>✅ New Way (AEO):</strong></p>
                        <p className="text-sm text-purple-700 ml-4">• "How much does a furnace replacement cost in 19102?" (HVAC)</p>
                        <p className="text-sm text-purple-700 ml-4">• "What is the first thing to do when a basement floods in Philadelphia?" (Plumbing/Restoration)</p>
                        <p className="text-sm text-purple-700 ml-4">• "Who is the best roofer near Lower Paxton for storm damage?" (Roofing)</p>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded mt-2 border-l-4 border-yellow-400">
                        <p className="text-xs text-yellow-800"><strong>🔥 Why This Matters:</strong> When someone asks Siri, ChatGPT, or Google the exact question you answered in your blog, YOUR content becomes the #1 recommendation!</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded mt-2 border-l-4 border-blue-500">
                        <p className="text-xs text-blue-800"><strong>🔧 TOOL SYNC:</strong> Use the <strong>❓ FAQ/Website Content Generator</strong> to generate natural-language Q&As optimized for voice search. The questions it creates mirror how real people ask Siri and Alexa — turn them into H2 headers on your service pages for an instant voice-search boost.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-purple-600 text-xl">✅</span>
                    <div>
                      <strong>Target "near me" keywords naturally</strong>
                      <p className="text-sm text-slate-600 mt-1">Include phrases like:</p>
                      <p className="text-sm bg-slate-100 p-2 rounded mt-2">
                        • "HVAC repair near me"<br/>
                        • "best plumber in [neighborhood]"<br/>
                        • "emergency electrician [city]"<br/>
                        • "affordable [service] [zip code]"
                      </p>
                      <p className="text-xs text-slate-500 mt-1">💡 Don't stuff keywords - use them naturally in sentences</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-purple-600 text-xl">✅</span>
                    <div>
                      <strong>Add customer testimonials with location mentions</strong>
                      <p className="text-sm bg-slate-100 p-2 rounded mt-2">
                        "John from Fishtown said: 'Best HVAC service in Philadelphia! Fixed our AC in 2 hours.'"
                      </p>
                      <p className="text-xs text-slate-500 mt-1">💡 Why: Testimonials with locations boost local relevance</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-purple-600 text-xl">✅</span>
                    <div>
                      <strong>Create service area pages for nearby cities</strong>
                      <p className="text-sm text-slate-600 mt-1">Make pages for each city you serve:</p>
                      <p className="text-sm bg-slate-100 p-2 rounded mt-2">
                        yoursite.com/philadelphia-hvac-repair<br/>
                        yoursite.com/bucks-county-hvac-repair<br/>
                        yoursite.com/chester-county-hvac-repair
                      </p>
                      <p className="text-xs text-slate-500 mt-1">💡 Include unique content about each area (not just city name swaps!)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-purple-600 text-xl">✅</span>
                    <div>
                      <strong>Monthly content updates (covered in Roadmap!)</strong>
                      <p className="text-sm text-slate-600 mt-1">
                        <strong className="text-green-700">Week 4 Friday:</strong> Publish monthly blog post (45 min) - this is scheduled in your 30-Day Roadmap!<br/>
                        Target: 1 local SEO blog post per month = 12 new ranking pages per year
                      </p>
                      <p className="text-xs text-slate-500 mt-1">💡 Why: Fresh content signals active business to Google. Blog posts are your #1 SEO growth tool!</p>
                      <p className="text-xs text-green-600 mt-1">✅ No need to figure this out yourself - just follow the roadmap and you're covered!</p>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* SECTION 4: TECHNICAL SEO */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl mb-4 border-2 border-yellow-400">
              <summary className="font-bold text-xl text-yellow-900 cursor-pointer mb-3">🛠️ SECTION 4: Technical SEO (Free Tools)</summary>
              <div className="mt-4 space-y-4 text-slate-800">
                <p className="font-semibold text-yellow-800">Behind-the-scenes optimization that makes Google happy:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-600 text-xl">✅</span>
                    <div>
                      <strong>Submit sitemap to Google Search Console</strong>
                      <p className="text-sm text-slate-600 mt-1">Step 1: Go to <a href="https://search.google.com/search-console" target="_blank" className="text-blue-600 underline">Google Search Console</a></p>
                      <p className="text-sm text-slate-600 mt-1">Step 2: Add your website</p>
                      <p className="text-sm text-slate-600 mt-1">Step 3: Submit your sitemap (usually yoursite.com/sitemap.xml)</p>
                      <p className="text-xs text-slate-500 mt-1">💡 Why: Tells Google exactly which pages to index</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-yellow-600 text-xl">✅</span>
                    <div>
                      <strong>Fix broken links</strong>
                      <p className="text-sm text-slate-600 mt-1">Tool: <a href="https://www.brokenlinkcheck.com/" target="_blank" className="text-blue-600 underline">Free Broken Link Checker</a></p>
                      <p className="text-sm text-slate-600 mt-1">Enter your URL → Find broken links → Fix or remove them</p>
                      <p className="text-xs text-slate-500 mt-1">💡 Why: Broken links hurt user experience and SEO rankings</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-yellow-600 text-xl">✅</span>
                    <div>
                      <strong>Make site mobile-friendly</strong>
                      <p className="text-sm text-slate-600 mt-1">Test: <a href="https://search.google.com/test/mobile-friendly" target="_blank" className="text-blue-600 underline">Google Mobile-Friendly Test</a></p>
                      <p className="text-sm text-slate-600 mt-1">If not mobile-friendly, ask your web developer to fix (or use responsive template)</p>
                      <p className="text-xs text-slate-500 mt-1">💡 Why: 60%+ of searches are on mobile - Google prioritizes mobile-friendly sites</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-yellow-600 text-xl">✅</span>
                    <div>
                      <strong>Add SSL certificate (HTTPS)</strong>
                      <p className="text-sm text-slate-600 mt-1">Check if you have it: Does your URL start with "https://" (not "http://")?</p>
                      <p className="text-sm text-slate-600 mt-1">If not, contact your web host - most offer free SSL (Let's Encrypt)</p>
                      <p className="text-xs text-slate-500 mt-1">💡 Why: Google requires HTTPS for good rankings + builds customer trust</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-yellow-600 text-xl">✅</span>
                    <div>
                      <strong>Check site speed regularly</strong>
                      <p className="text-sm text-slate-600 mt-1">Tool: <a href="https://pagespeed.web.dev/" target="_blank" className="text-blue-600 underline">PageSpeed Insights</a></p>
                      <p className="text-sm text-slate-600 mt-1">Goal: Score 80+ on mobile (green rating)</p>
                      <p className="text-sm text-slate-600 mt-1">Quick fixes: Compress images, enable caching, minimize CSS/JS</p>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* SECTION 5: LOCAL SEO */}
            <details className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl mb-4 border-2 border-red-400">
              <summary className="font-bold text-xl text-red-900 cursor-pointer mb-3">📍 SECTION 5: Local SEO Mastery - The NAP+ Trick</summary>
              <div className="mt-4 space-y-4 text-slate-800">
                <p className="font-semibold text-red-800">Dominate local search results in your area:</p>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 text-xl">✅</span>
                    <div>
                      <strong>Get listed in free local directories</strong>
                      <p className="text-sm text-slate-600 mt-1">Submit your business to (all free):</p>
                      <p className="text-sm bg-slate-100 p-2 rounded mt-2">
                        • <a href="https://www.yelp.com/signup" target="_blank" className="text-blue-600 underline">Yelp for Business</a><br/>
                        • <a href="https://www.yellowpages.com/business-solutions" target="_blank" className="text-blue-600 underline">Yellow Pages</a><br/>
                        • <a href="https://www.angieslist.com/business-center/" target="_blank" className="text-blue-600 underline">Angi (Angie's List)</a><br/>
                        • <a href="https://www.bbb.org/get-accredited" target="_blank" className="text-blue-600 underline">Better Business Bureau</a><br/>
                        • Facebook Business Page<br/>
                        • <strong className="text-red-700">🍎 <a href="https://businessconnect.apple.com" target="_blank" className="text-blue-600 underline">Apple Business Connect</a> (CRITICAL for iPhone users!)</strong>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">💡 Why: More citations = stronger local SEO signals to Google</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-red-600 text-xl">✅</span>
                    <div>
                      <strong>Ensure NAP consistency EVERYWHERE</strong>
                      <p className="text-sm text-slate-600 mt-1">Your Name, Address, Phone must be IDENTICAL on:</p>
                      <p className="text-sm bg-slate-100 p-2 rounded mt-2">
                        ✅ Google Business Profile<br/>
                        ✅ Your website footer<br/>
                        ✅ Yelp<br/>
                        ✅ Yellow Pages<br/>
                        ✅ Facebook<br/>
                        ✅ All directories
                      </p>
                      <p className="text-xs text-red-700 mt-2 font-semibold">
                        ⚠️ CRITICAL: Even minor differences hurt SEO ("St" vs "Street", "Suite 100" vs "#100")
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-red-600 text-xl">✅</span>
                    <div>
                      <strong>The NAP+ Trick: Apple Business Connect</strong>
                      <p className="text-sm text-slate-600 mt-1">Today, <strong>Apple Maps has overtaken Google Maps</strong> for many iPhone users.</p>
                      <div className="bg-red-50 p-2 rounded mt-2 border-l-4 border-red-400">
                        <p className="text-sm text-red-800"><strong>🍎 Action Required:</strong> Go to <a href="https://businessconnect.apple.com" target="_blank" className="text-blue-600 underline font-bold">Apple Business Connect</a> and claim your listing.</p>
                        <p className="text-sm text-red-700 mt-1">Ensure your NAP is <strong>100% identical</strong> to your Google Business Profile.</p>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded mt-2 border-l-4 border-yellow-400">
                        <p className="text-xs text-yellow-800"><strong>🔥 Why This Matters:</strong> When an iPhone user says "Hey Siri, find a [your trade] near me," Siri pulls from Apple Maps. If you're not there with consistent NAP, you're invisible to 60%+ of smartphone users!</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded mt-2 border-l-4 border-purple-500">
                        <p className="text-xs text-purple-800"><strong>🍎 The Siri Shield (Pro Tip):</strong> iPhone users today use "App Clips" and Siri to book services directly. If your Apple Business Connect profile has <strong>"Same-Day Service"</strong> checked in the attributes, Siri will prioritize you over a business that only has a phone number.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-red-600 text-xl">✅</span>
                    <div>
                      <strong>Create city-specific landing pages</strong>
                      <p className="text-sm text-slate-600 mt-1">For each city you serve, create a dedicated page with:</p>
                      <p className="text-sm bg-slate-100 p-2 rounded mt-2">
                        • City name in URL, title, H1<br/>
                        • Unique content about serving that area<br/>
                        • Local landmarks mentioned<br/>
                        • Customer testimonials from that city<br/>
                        • Driving directions from city to your location
                      </p>
                      <p className="text-xs text-slate-500 mt-1">💡 Don't just swap city names - write unique content for each!</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-red-600 text-xl">✅</span>
                    <div>
                      <strong>Embed Google Maps on your contact page</strong>
                      <p className="text-sm text-slate-600 mt-1">Go to Google Maps → Search your business → Click "Share" → "Embed a map" → Copy code</p>
                      <p className="text-xs text-slate-500 mt-1">💡 Why: Shows Google your exact location + helps customers find you</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-red-600 text-xl">✅</span>
                    <div>
                      <strong>Get backlinks from local organizations</strong>
                      <p className="text-sm text-slate-600 mt-1">Free/cheap local backlinks:</p>
                      <p className="text-sm bg-slate-100 p-2 rounded mt-2">
                        • Join local Chamber of Commerce (get listed on their site)<br/>
                        • Sponsor local Little League team (link from their site)<br/>
                        • Partner with complementary local businesses<br/>
                        • Get featured in local news (send press releases)<br/>
                        • Guest post on local blogs
                      </p>
                      <p className="text-xs text-slate-500 mt-1">💡 Why: Local backlinks = strong local SEO signal</p>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* SECTION 6: MONTHLY MAINTENANCE */}
            <details className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-xl mb-4 border-2 border-slate-400">
              <summary className="font-bold text-xl text-slate-900 cursor-pointer mb-3">📅 SECTION 6: Monthly Maintenance (Covered in Roadmap!)</summary>
              <div className="mt-4 space-y-4 text-slate-800">
                <p className="font-semibold text-green-800 text-lg">✅ Good news: All ongoing SEO maintenance is already scheduled in your 30-Day Roadmap!</p>
                <p className="text-slate-700 mb-4">
                  You don't need to figure out when or how to maintain your SEO. Just follow the roadmap and you're covered. Here's what's included:
                </p>

                <div className="bg-green-50 p-5 rounded-lg border-2 border-green-500 mb-4">
                  <h4 className="font-bold text-green-900 mb-3">🔄 WEEKLY SEO TASKS (Every Monday - 10 min):</h4>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-green-600 text-2xl">✓</span>
                      <div>
                        <strong className="text-slate-800">Answer GBP Q&A Questions</strong>
                        <p className="text-sm text-slate-600 mt-1">
                          Seed 1-2 strategic questions + answer with keywords<br/>
                          <strong className="text-blue-700">📋 Location:</strong> Roadmap → Every Monday (Week 1, 2, 3, 4)<br/>
                          <strong className="text-green-700">💡 Impact:</strong> Q&A content shows in Google search results = free SEO boost!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-500 mb-4">
                  <h4 className="font-bold text-blue-900 mb-3">📝 MONTHLY SEO TASKS (45 min blog + 15 min NAP check):</h4>

                  <div className="bg-white p-3 rounded-lg mb-3">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 text-2xl">✓</span>
                      <div>
                        <strong className="text-slate-800">Publish Local SEO Blog Post (45 min)</strong>
                        <p className="text-sm text-slate-600 mt-1">
                          Write 500-word blog post targeting local search<br/>
                          Topics: "[Service] in [City]", "[Season] Tips", "Cost Guide"<br/>
                          <strong className="text-blue-700">📋 Location:</strong> Roadmap → Week 4 Friday<br/>
                          <strong className="text-green-700">💡 Impact:</strong> 1 post/month = 12 new ranking pages/year!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 text-2xl">✓</span>
                      <div>
                        <strong className="text-slate-800">NAP Consistency Check (15 min)</strong>
                        <p className="text-sm text-slate-600 mt-1">
                          Verify Name, Address, Phone matches on all platforms<br/>
                          Check: Website, GBP, Facebook, Yelp, Nextdoor, directories<br/>
                          <strong className="text-blue-700">📋 Location:</strong> Roadmap → Saturday 60 (Last Saturday of Month)<br/>
                          <strong className="text-green-700">💡 Impact:</strong> Inconsistent NAP can cost you 20+ ranking positions!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-5 rounded-lg border-2 border-orange-500 mb-4">
                  <h4 className="font-bold text-orange-900 mb-3">📊 MONTHLY ANALYTICS REVIEW (30 min):</h4>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-orange-600 text-2xl">✓</span>
                      <div>
                        <strong className="text-slate-800">Comprehensive Analytics Deep Dive</strong>
                        <p className="text-sm text-slate-600 mt-1">
                          Review all platform performance (GBP, Facebook, Nextdoor, Yelp, Website)<br/>
                          Check keyword rankings, monitor what's working<br/>
                          <strong className="text-blue-700">📋 Location:</strong> Roadmap → Saturday 60 (Last Saturday of Month)<br/>
                          <strong className="text-blue-700">📖 Guide:</strong> Use Analytics Dashboard Guide module for step-by-step instructions<br/>
                          <strong className="text-green-700">💡 Impact:</strong> Data-driven optimization = know what's working!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                  <p className="text-purple-900 font-semibold text-lg mb-2">📋 Total Monthly SEO Time Investment:</p>
                  <ul className="text-purple-800 space-y-1 ml-4">
                    <li><strong>Weekly Q&A:</strong> 10 min × 4 weeks = 40 min/month</li>
                    <li><strong>Monthly blog post:</strong> 45 min/month</li>
                    <li><strong>NAP consistency check:</strong> 15 min/month</li>
                    <li><strong>Analytics review:</strong> 30 min/month (included in Saturday 60)</li>
                  </ul>
                  <p className="text-purple-900 font-bold mt-3 text-lg">
                    = ~100 minutes per month total
                  </p>
                  <p className="text-purple-800 text-sm mt-2">
                    That's less than 2 hours per month for SEO that compounds over time!
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg border-2 border-green-600 mt-4">
                  <p className="text-green-900 font-bold text-lg mb-2">✅ You're Already Set Up for Success!</p>
                  <p className="text-green-800 text-sm">
                    <strong>No need to set calendar reminders or figure out when to do these tasks.</strong> Just open your 30-Day Roadmap each week and check off the boxes. We've scheduled everything for optimal SEO results!
                  </p>
                  <p className="text-green-800 text-sm mt-2">
                    Results timeline: See improvements in 2-4 weeks, major ranking gains in 3-6 months as blog posts accumulate.
                  </p>
                </div>
              </div>
            </details>

            {/* FOOTER SUMMARY */}
            <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-6 rounded-xl mt-6 border-2 border-orange-500">
              <h3 className="text-orange-900 font-bold text-lg mb-3">🎯 Quick Reference: The Complete Workflow</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-orange-900">
                <div>
                  <strong className="block mb-2">📅 INITIAL SETUP (One Time - 2-3 hours):</strong>
                  <ul className="space-y-1 ml-4">
                    <li>✓ Section 1: Quick Wins (30 min)</li>
                    <li>✓ Section 2: On-Page SEO (1 hour)</li>
                    <li>✓ Section 4: Technical SEO (30 min)</li>
                    <li>✓ Section 5: Local SEO (30-60 min)</li>
                  </ul>
                </div>
                <div>
                  <strong className="block mb-2">🔄 ONGOING (Monthly - ~100 min):</strong>
                  <ul className="space-y-1 ml-4">
                    <li>✓ Weekly GBP Q&A (40 min/month)</li>
                    <li>✓ Monthly blog post (45 min)</li>
                    <li>✓ NAP consistency check (15 min)</li>
                    <li>✓ Analytics review (30 min)</li>
                    <li className="mt-2 text-green-800 font-semibold">📋 All scheduled in 30-Day Roadmap!</li>
                  </ul>
                </div>
              </div>
              <p className="text-orange-900 mt-4 font-semibold">
                💰 Total Cost: $0 | ⏰ Time: 2-3 hours setup + ~100 min/month ongoing | 📈 Results: See improvements in 2-4 weeks!
              </p>
            </div>

            {/* Saturday 60 Bridge */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl mt-6 border-2 border-indigo-500">
              <h3 className="text-indigo-900 font-bold text-lg mb-3">📅 DON'T GUESS THE DATE</h3>
              <p className="text-indigo-800 leading-relaxed">
                All these monthly checks are pre-loaded into your <strong>📋 30-DAY DOMINATION ROADMAP</strong>. When it's time to check your NAP or update your blog, the roadmap will tell you exactly which tool to use.
              </p>
              <p className="text-indigo-700 text-sm mt-2 italic">
                💡 The "Saturday 60" (last Saturday of each month) includes the NAP Consistency Sweep and Answer Engine Audit—all scheduled for you!
              </p>
            </div>

            {/* Essential SEO Links */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mt-6 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">🔗 Essential SEO Links & Tools</h3>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>📊 Google Search Console:</strong> <a href="https://search.google.com/search-console" target="_blank" className="text-blue-600 underline font-bold">search.google.com/search-console</a> (Submit sitemap, monitor rankings)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>⚡ Google PageSpeed Insights:</strong> <a href="https://pagespeed.web.dev/" target="_blank" className="text-blue-600 underline font-bold">pagespeed.web.dev</a> (Test site speed — goal: 80+ on mobile)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>📱 Google Mobile-Friendly Test:</strong> <a href="https://search.google.com/test/mobile-friendly" target="_blank" className="text-blue-600 underline font-bold">search.google.com/test/mobile-friendly</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🖼️ TinyPNG:</strong> <a href="https://tinypng.com" target="_blank" className="text-blue-600 underline font-bold">tinypng.com</a> (Compress images before uploading — free)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🔗 Broken Link Checker:</strong> <a href="https://www.brokenlinkcheck.com/" target="_blank" className="text-blue-600 underline font-bold">brokenlinkcheck.com</a> (Find and fix broken links)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🛠️ Free Schema Generator:</strong> <a href="https://technicalseo.com/tools/schema-markup-generator/" target="_blank" className="text-blue-600 underline font-bold">technicalseo.com/tools/schema-markup-generator</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🍎 Apple Business Connect:</strong> <a href="https://businessconnect.apple.com" target="_blank" className="text-blue-600 underline font-bold">businessconnect.apple.com</a> (Crucial for Siri & iPhone searches)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>📍 Google Business Profile:</strong> <a href="https://business.google.com" target="_blank" className="text-blue-600 underline font-bold">business.google.com</a> (Claim & manage your listing)</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-2 rounded mt-3 border-l-4 border-yellow-400">
                <p className="text-yellow-800 text-xs"><strong>💡 Quick Tip:</strong> Bookmark all of these in a "SEO Tools" folder on your phone—you'll reference them during your Saturday 60 monthly review!</p>
              </div>
            </div>

            {/* Bottom Close Button */}
            <div className="text-center mt-6">
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 text-lg">
                ✕ Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* HYPER-LOCAL SEO MODAL */}
      {activeModal === 'hyperLocalSeo' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-5xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">📍 HYPER-LOCAL SEO</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-red-100 to-orange-100 p-6 rounded-xl mb-6 border-2 border-red-500">
              <h3 className="text-red-900 font-bold text-2xl mb-3">The "Zip Code" Strategy for Local Domination</h3>
              <div className="bg-white/70 p-4 rounded-lg">
                <p className="text-red-900 leading-relaxed">
                  <strong>The Strategy:</strong> Today, Google doesn't just look at "cities"—it looks at <strong>neighborhoods.</strong> If your business is in one town but you want to work in the wealthy suburb 10 miles away, you have to prove to the algorithm that you are <strong>"physically" active there.</strong>
                </p>
              </div>
            </div>

            {/* Strategy 1: Core 10 Zip Code Strategy */}
            <details className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-blue-500" open>
              <summary className="font-bold text-xl text-blue-900 cursor-pointer mb-3 hover:text-blue-700">
                1️⃣ The "Core 10" Zip Code Strategy <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800 text-lg">🎯 The Goal: Focus your SEO power on high-profit areas.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">❌ The Problem:</strong>
                    <p className="mt-1 text-slate-700">Most contractors put a "50-mile radius" on their profile. <strong>This is a mistake.</strong> It dilutes your authority.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-green-700">✅ The Hack:</strong>
                    <p className="mt-1 text-slate-700">Identify the <strong>10 specific zip codes</strong> where the homes are oldest (more repairs) or the income is highest.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">📋 The Action:</strong>
                    <p className="mt-1 text-slate-700">List these zip codes <strong>explicitly</strong> in your Google Business Profile "Service Areas."</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">🏆 The Result:</strong>
                    <p className="mt-1 text-green-700">Google will prioritize you for "near me" searches in those <strong>high-profit pockets</strong> rather than trying to show you to the entire county.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Strategy 2: The Landmark Hack (Semantic SEO) */}
            <details className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-purple-500">
              <summary className="font-bold text-xl text-purple-900 cursor-pointer mb-3 hover:text-purple-700">
                2️⃣ The "Landmark Hack" (Semantic SEO) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="font-bold text-purple-800 text-lg">🎯 The Goal: Force Google's AI to associate your business with specific, high-value neighborhoods.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">❌ The Problem:</strong>
                    <p className="mt-1 text-slate-700">Every contractor says they serve "[City Name]," which is too broad to rank for. You want to rank for the <strong>specific streets where the money is.</strong></p>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                    <p className="text-yellow-800 font-bold">💡 The Logic:</p>
                    <p className="text-yellow-700 text-sm mt-1">Google's AI now <strong>"sees" the background</strong> of your job site photos. When you name-drop a local landmark and pair it with a trade-specific <strong>"Environmental Factor"</strong> (like salt air, historic codes, or storm paths), you create a <strong>Local Authority Signal</strong> that competitors can't fake.</p>
                  </div>

                  {/* Trade-Specific Environmental Landmark Hacks */}
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700 text-lg">🔧 Trade-Specific "Environmental" Landmark Hacks:</strong>
                    <div className="space-y-4 mt-3">

                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="font-bold text-blue-800 mb-2">🌡️ HVAC (The Efficiency Angle)</p>
                        <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                          <p className="text-slate-700 text-sm italic">📝 <strong>The Script:</strong> "Replacing a 20-year-old system at a home right near <strong>[Local High School]</strong>. In our part of <strong>[Town Name]</strong>, the summer humidity kills old units. Notice the efficiency increase with this new 18-SEER install."</p>
                        </div>
                        <p className="text-blue-700 text-xs mt-2">🏆 <strong>The Win:</strong> Targets neighbors with similarly aged homes in that specific school district.</p>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                        <p className="font-bold text-yellow-800 mb-2">⚡ Electrical (The Safety/Code Angle)</p>
                        <div className="bg-white p-3 rounded border-l-4 border-yellow-400">
                          <p className="text-slate-700 text-sm italic">📝 <strong>The Script:</strong> "Bringing a historic <strong>[Neighborhood Name]</strong> home up to code near <strong>[Old Town Square/Landmark]</strong>. These older estates require specialized knowledge of cloth wiring and lath-and-plaster. Safety first for our <strong>[Town Name]</strong> neighbors."</p>
                        </div>
                        <p className="text-yellow-700 text-xs mt-2">🏆 <strong>The Win:</strong> Signals to Google that you are the specialist for the "Historic District" zip codes.</p>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                        <p className="font-bold text-orange-800 mb-2">🏠 Roofing (The Weather/Durability Angle)</p>
                        <div className="bg-white p-3 rounded border-l-4 border-orange-400">
                          <p className="text-slate-700 text-sm italic">📝 <strong>The Script:</strong> "Just finished a new storm-rated roof install for a neighbor near <strong>[Local Lake/Park]</strong>. Being so close to the <strong>[Landmark]</strong>, the wind shear is higher than average. We used Class 4 Impact Resistant shingles to ensure this house stays sealed."</p>
                        </div>
                        <p className="text-orange-700 text-xs mt-2">🏆 <strong>The Win:</strong> Connects your "Scientific Proof" with a geographic location.</p>
                      </div>

                      <div className="bg-cyan-50 p-4 rounded-lg border-l-4 border-cyan-500">
                        <p className="font-bold text-cyan-800 mb-2">🔧 Plumbing / Restoration (The Infrastructure Angle)</p>
                        <div className="bg-white p-3 rounded border-l-4 border-cyan-400">
                          <p className="text-slate-700 text-sm italic">📝 <strong>The Script:</strong> "Responded to a burst pipe near <strong>[Local University]</strong>. The older clay pipes in this part of <strong>[City]</strong> are prone to root intrusion this time of year. Another <strong>[Town Name]</strong> basement dried and protected."</p>
                        </div>
                        <p className="text-cyan-700 text-xs mt-2">🏆 <strong>The Win:</strong> Positions you as the "Infrastructure Expert" for that specific grid of the city.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Connect this to the <strong>📍 Google Business Post Optimizer</strong>. The tool will prompt you: <em>"Which landmark or school are you near?"</em> and <em>"What is one environmental factor (age, weather, salt air) for this job?"</em> This creates posts that are <strong>3x more powerful</strong> for local rankings than generic check-ins.</p>
                  </div>

                  {/* Landmark Cheat Sheet */}
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-lg border-2 border-purple-400 mt-3">
                    <strong className="text-purple-800 text-lg">📋 Your "Landmark Cheat Sheet"</strong>
                    <p className="text-purple-700 text-sm mt-1 mb-3">List your top 5 local landmarks to use in future posts. Keep this handy on your phone:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="bg-white p-2 rounded flex items-center gap-2">
                        <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                        <p className="text-slate-600 text-sm italic">🏫 Nearest High School / University</p>
                      </div>
                      <div className="bg-white p-2 rounded flex items-center gap-2">
                        <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                        <p className="text-slate-600 text-sm italic">🌳 Biggest Park / Lake / Trail</p>
                      </div>
                      <div className="bg-white p-2 rounded flex items-center gap-2">
                        <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                        <p className="text-slate-600 text-sm italic">🏛️ Town Hall / Historic Square</p>
                      </div>
                      <div className="bg-white p-2 rounded flex items-center gap-2">
                        <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                        <p className="text-slate-600 text-sm italic">🏟️ Local Stadium / Arena</p>
                      </div>
                      <div className="bg-white p-2 rounded flex items-center gap-2">
                        <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                        <p className="text-slate-600 text-sm italic">🏪 Famous Local Business / Restaurant</p>
                      </div>
                    </div>
                    <p className="text-purple-600 text-xs mt-3 italic">💡 Pro Tip: Rotate through these landmarks so Google sees you active across the entire service area, not just one corner.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Strategy 3: Neighborhood Landing Pages */}
            <details className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl mb-4 border-2 border-green-500">
              <summary className="font-bold text-xl text-green-900 cursor-pointer mb-3 hover:text-green-700">
                3️⃣ Neighborhood Landing Pages <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800 text-lg">🎯 The Goal: Rank in towns where you don't have a physical office.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">❌ The Problem:</strong>
                    <p className="mt-1 text-slate-700">If you want to rank in Lower Paxton but your address is in Harrisburg, Google doesn't automatically show you there.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-green-700">🔧 The Setup:</strong>
                    <p className="mt-1 text-slate-700">Use the <strong className="text-orange-600">❓ FAQ/Website Content Generator</strong> in your library to create a dedicated page titled:</p>
                    <div className="bg-green-50 p-3 rounded mt-2 border-l-4 border-green-500">
                      <p className="text-green-800 italic font-bold">"Best [Your Service] in Lower Paxton, PA"</p>
                    </div>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">📝 The Content:</strong>
                    <p className="mt-1 text-slate-700 mb-2">Make it hyper-local by mentioning:</p>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Local street names</strong> (e.g., "We frequently service homes on Colonial Road and Linglestown Road")</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Subdivision or HOA names</strong> (e.g., "Trusted by homeowners in Foxchase Estates and Pine Creek Village")</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Nearest fire station</strong> (shows you know the area)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Specific local weather patterns</strong> (e.g., "Basement flooding common near Spring Creek")</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Open the <strong>❓ FAQ/Website Content Generator</strong> and type your neighborhood or town name as the Topic (e.g., "HVAC Services in Camp Hill" or "Plumbing FAQ for Mechanicsburg"). <strong>Pro Hack:</strong> Don't just list street names; mention a local <strong>Subdivision or Homeowners Association.</strong> Google's AI now indexes HOA names to determine who the "trusted neighborhood pro" is.</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 mt-3">
                    <strong className="text-green-800">🏆 The Result:</strong>
                    <p className="mt-1 text-green-700">You will show up in <strong>organic search results</strong> for that specific town, even without a physical office there.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Strategy 4: Local Authority Backlink */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl mb-4 border-2 border-yellow-500">
              <summary className="font-bold text-xl text-yellow-900 cursor-pointer mb-3 hover:text-yellow-700">
                4️⃣ The "Local Authority" Backlink <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800 text-lg">🎯 The Goal: Get the backlinks that actually matter for local SEO.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                    <p className="text-blue-800 font-bold">💡 Key Insight:</p>
                    <p className="text-blue-700 text-sm mt-1">A link from a local neighborhood blog or a high school sports sponsorship is worth <strong>10x more for SEO</strong> than a generic directory.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-yellow-700">🎯 The Hack:</strong>
                    <p className="mt-1 text-slate-700">Get listed on the <strong>"Recommended Pros"</strong> list of a local Homeowners Association (HOA) website.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700">💡 Other High-Value Local Backlinks:</strong>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>Local chamber of commerce</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>High school athletic booster sponsorships</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>Local charity event pages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>Neighborhood Facebook group "Recommended Vendors" lists</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>Local news site mentions</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">🏆 Why This Works:</strong>
                    <p className="mt-1 text-green-700">These hyper-local links are the <strong>"secret sauce"</strong> that tells Google you are the <strong>community's top choice.</strong></p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500 mt-3">
                    <p className="text-purple-800 text-sm font-bold mb-2">💡 The Nextdoor Shortcut ("Social Backlink"):</p>
                    <p className="text-purple-700 text-sm">A "Recommendation" on Nextdoor acts as a "Social Backlink" today. One "Local Pro" recommendation in a private neighborhood group is worth more than 50 generic directory listings.</p>
                    <p className="text-purple-800 text-xs mt-2"><strong>📋 The Action:</strong> Use the <strong>⭐ Review Maximizer</strong> to generate a "Nextdoor Shoutout" script for your customers in those Core 10 zip codes.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Quick Action Checklist */}
            <div className="bg-gradient-to-r from-red-100 to-orange-100 p-6 rounded-xl mb-6 border-4 border-red-500">
              <h3 className="text-red-900 font-bold text-2xl mb-4">📍 HYPER-LOCAL SEO CHECKLIST</h3>

              <div className="bg-white p-4 rounded-lg mb-4">
                <p className="text-red-800 font-bold text-lg mb-3">Dominate your best neighborhoods:</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-red-800">Identify your "Core 10" zip codes</p>
                      <p className="text-sm text-red-700">Oldest homes + highest income = best targets</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-red-800">Update GBP Service Areas</p>
                      <p className="text-sm text-red-700">List specific zip codes, not "50-mile radius"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-red-800">Take 5 "Landmark" photos</p>
                      <p className="text-sm text-red-700">Truck + local landmark in each target area</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-red-800">Create 3 Neighborhood Landing Pages</p>
                      <p className="text-sm text-red-700">Use FAQ Generator with local street names & details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <span className="text-2xl">☐</span>
                    <div>
                      <p className="font-bold text-red-800">Get 1 local backlink</p>
                      <p className="text-sm text-red-700">HOA list, sports sponsorship, or chamber of commerce</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg border-l-4 border-green-500">
                <p className="text-green-900 font-bold text-xl text-center">
                  🏆 Complete this checklist = <span className="text-green-700">Own your zip codes!</span>
                </p>
              </div>
            </div>

            {/* Essential Business Links */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">🔗 Essential Business Links</h3>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🍎 Claim your Apple Place Card:</strong> <a href="https://businessconnect.apple.com" target="_blank" className="text-blue-600 underline font-bold">businessconnect.apple.com</a> (Crucial for "Siri, find a pro in [Neighborhood]")</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🏘️ Find your Neighborhood Groups:</strong> <a href="https://nextdoor.com/find-neighborhood" target="_blank" className="text-blue-600 underline">nextdoor.com/find-neighborhood</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>📊 Check Zip Code Wealth/Age Data:</strong> <a href="https://census.gov/quickfacts" target="_blank" className="text-blue-600 underline">census.gov/quickfacts</a> (Find your "Core 10" targets)</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-2 rounded mt-3 border-l-4 border-yellow-400">
                <p className="text-yellow-800 text-xs"><strong>💡 Quick Tip:</strong> You can also just search <strong>"[City] Zip Code Map by Income"</strong> on Google Images for a 5-second visual of your Core 10 targets.</p>
              </div>
            </div>

            {/* Saturday 60 Bridge */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl mb-4 border-2 border-indigo-500">
              <h3 className="text-indigo-900 font-bold text-xl mb-3">📅 ONGOING DOMINATION</h3>
              <p className="text-indigo-800 leading-relaxed">
                Your <strong>📋 30-DAY DOMINATION ROADMAP</strong> includes a "Zip Code Audit" on the last Saturday of every month. Don't worry about remembering to update your areas—the roadmap will prompt you!
              </p>
              <p className="text-indigo-700 text-sm mt-2 italic">
                💡 The "Saturday 60" strategic review ensures your Core 10 stays optimized for the highest-profit neighborhoods.
              </p>
            </div>

            {/* Bottom Close Button */}
            <div className="text-center mt-6">
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 text-lg">
                ✕ Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* NEIGHBORHOOD SNIPER MODAL */}
      {activeModal === 'neighborhoodSniper' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-5xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">🏘️ THE NEIGHBORHOOD SNIPER</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl mb-6 border-2 border-green-500">
              <h3 className="text-green-900 font-bold text-2xl mb-3">Dominating "Neighbors of..." Groups & Local Communities</h3>
              <div className="bg-white/70 p-4 rounded-lg mb-4">
                <p className="text-green-900 leading-relaxed">
                  <strong>The Opportunity:</strong> Monitoring "Neighbors of..." Facebook groups is the fastest way to get high-intent leads today. However, because these groups are tight-knit, you must use <strong>Speed, Social Proof, and Stealth</strong> to avoid being banned for "selling".
                </p>
              </div>
              <div className="bg-gradient-to-r from-yellow-100 to-amber-100 p-4 rounded-lg border-l-4 border-yellow-500">
                <p className="text-yellow-900 font-bold">
                  ⚡ Key Insight: Being the first or second to respond increases your "win" rate by over <span className="text-green-700 text-xl">60%</span>!
                </p>
              </div>
            </div>

            {/* Strategy 1: The Signal Search */}
            <details className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl mb-4 border-2 border-red-500" open>
              <summary className="font-bold text-xl text-red-900 cursor-pointer mb-3 hover:text-red-700">
                1️⃣ The "Signal Search" (Expanded Keywords) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                  <p className="font-bold text-red-800 text-lg">🎯 The Goal: Set alerts to find customers at the exact moment their "Problem" or "Project" begins.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">❌ The Problem:</strong>
                    <p className="mt-1 text-slate-700">You cannot spend all day scrolling; by the time you see a "Need a plumber" post manually, you've already lost to 20 other commenters.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">📋 The Action:</strong>
                    <p className="mt-1 text-slate-700">Use the search bar in local Facebook Groups or Nextdoor to look for these trade-specific <strong>"Trigger" words:</strong></p>

                    {/* Trade-Specific Trigger Words Table */}
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-800 text-white">
                            <th className="p-2 text-left rounded-tl-lg">Trade</th>
                            <th className="p-2 text-left">🚨 "Emergency" Signals<br/><span className="text-yellow-300 text-xs font-normal">(High Urgency)</span></th>
                            <th className="p-2 text-left rounded-tr-lg">💰 "Project" Signals<br/><span className="text-green-300 text-xs font-normal">(High Profit)</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-orange-50 border-b border-slate-200">
                            <td className="p-2 font-bold text-slate-800">🏠 Roofing</td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"Leaking"</span>
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"Missing shingles"</span>
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"Hail"</span>
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"Tarp"</span>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"Solar ready"</span>
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"New gutters"</span>
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"Skylight"</span>
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"Roof age"</span>
                              </div>
                            </td>
                          </tr>
                          <tr className="bg-yellow-50 border-b border-slate-200">
                            <td className="p-2 font-bold text-slate-800">⚡ Electrician</td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"Flickering"</span>
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"Burning smell"</span>
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"Sparking"</span>
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"Power out"</span>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"EV Charger"</span>
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"Tesla wall"</span>
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"Panel upgrade"</span>
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"Hot tub"</span>
                              </div>
                            </td>
                          </tr>
                          <tr className="bg-blue-50 border-b border-slate-200">
                            <td className="p-2 font-bold text-slate-800">🌡️ HVAC</td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"Not blowing cold"</span>
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"No heat"</span>
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"Leaking water"</span>
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"Loud"</span>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"High electric bill"</span>
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"Air quality"</span>
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"Humidifier"</span>
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"Smart nest"</span>
                              </div>
                            </td>
                          </tr>
                          <tr className="bg-cyan-50">
                            <td className="p-2 font-bold text-slate-800 rounded-bl-lg">🔧 Plumbing</td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"Burst"</span>
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"Clogged"</span>
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"Overflow"</span>
                                <span className="bg-red-100 px-2 py-0.5 rounded text-red-800 text-xs">"No water"</span>
                              </div>
                            </td>
                            <td className="p-2 rounded-br-lg">
                              <div className="flex flex-wrap gap-1">
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"Water softener"</span>
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"Tankless"</span>
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"Filtered water"</span>
                                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">"Low flow"</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                    <p className="text-yellow-800 text-sm"><strong>💡 The Strategy:</strong> Today, people don't just post "I need a pro." They post a <strong>symptom.</strong> By searching for "High electric bill" or "Flickering lights," you find the customer <strong>before they realize</strong> they need a full system replacement.</p>
                  </div>

                  {/* The Professional Non-Admin Hack */}
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700 text-lg">🔧 The Professional "Non-Admin" Hack (Groups Watcher)</strong>
                    <p className="mt-2 text-slate-700">Since Facebook doesn't naturally give you alerts for groups you don't own, most pros today use a tool like <a href="https://groupswatcher.com" target="_blank" className="text-blue-600 underline font-bold">Groups Watcher</a> or <a href="https://devi-ai.com" target="_blank" className="text-blue-600 underline font-bold">Devi AI</a>.</p>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mt-4 border-2 border-blue-400">
                      <p className="font-bold text-blue-800 mb-3">📋 How to Set It Up:</p>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                          <div>
                            <p className="font-bold text-blue-800">Install the Extension</p>
                            <p className="text-slate-700 text-sm">Add <a href="https://groupswatcher.com" target="_blank" className="text-blue-600 underline font-bold">Groups Watcher</a> or similar lead-gen extension to your Chrome browser on your computer.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                          <div>
                            <p className="font-bold text-blue-800">Select Your Groups</p>
                            <p className="text-slate-700 text-sm">Check the box next to your local groups (e.g., "Neighbors of Lower Paxton", "Central Penn Contractors", "Harrisburg Community").</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                          <div>
                            <p className="font-bold text-blue-800">Input Your Trade-Specific "Trigger" Keywords</p>
                            <p className="text-slate-700 text-sm mb-2">Use the table above! Add BOTH your <strong className="text-red-700">Emergency</strong> AND <strong className="text-green-700">Project</strong> keywords for maximum coverage.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                          <div>
                            <p className="font-bold text-blue-800">Set Up Push Notifications</p>
                            <p className="text-slate-700 text-sm">Connect the tool to your phone via <strong>Telegram</strong>, <strong>Slack</strong>, or a <strong>Push Notification</strong> service.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">✅ The Result:</strong>
                    <p className="mt-1 text-green-700">Your phone will buzz within <strong>3–5 minutes</strong> of a post being made—usually <strong>before the neighbor even gets their first comment.</strong></p>
                  </div>

                  {/* Manual Search Hack */}
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border-2 border-yellow-400 mt-4">
                    <strong className="text-yellow-800 text-lg">🆓 The "Manual" Search Hack (If you don't want to pay for tools)</strong>
                    <p className="mt-2 text-slate-700">If you want a free way to do this without extra software:</p>

                    <div className="space-y-2 mt-3">
                      <div className="flex items-start gap-3 bg-white p-2 rounded">
                        <span className="bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                        <p className="text-slate-700 text-sm">Open the Facebook App and go to your local group.</p>
                      </div>
                      <div className="flex items-start gap-3 bg-white p-2 rounded">
                        <span className="bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                        <p className="text-slate-700 text-sm">Tap the <strong>Magnifying Glass</strong> (Search) in the top right.</p>
                      </div>
                      <div className="flex items-start gap-3 bg-white p-2 rounded">
                        <span className="bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                        <p className="text-slate-700 text-sm">Type a <strong>symptom keyword</strong> from the table above (e.g., "Flickering" or "High electric bill").</p>
                      </div>
                      <div className="flex items-start gap-3 bg-white p-2 rounded border-2 border-red-300">
                        <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                        <p className="text-slate-700 text-sm"><strong className="text-red-700">Crucial Step:</strong> Tap <strong>"Most Recent"</strong> at the top.</p>
                      </div>
                      <div className="flex items-start gap-3 bg-white p-2 rounded">
                        <span className="bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                        <p className="text-slate-700 text-sm"><strong>The Habit:</strong> Bookmark that specific search page in your phone's browser. Instead of scrolling the "Home" feed, just tap that bookmark once a day to see the latest requests in order.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 mt-3">
                    <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Paste your top competitor's ad copy or Facebook post into the <strong>🕵️ Competitor Intel</strong>. It breaks down their messaging angles — the hooks, value props, and CTAs they're using. Add those themes to your Groups Watcher alerts. If they're pushing "Basement Waterproofing" or "AC Tune-Ups" hard, you want to be notified the second that topic hits a local group.</p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500 mt-3">
                    <p className="text-purple-800 text-sm"><strong>🔧 TOOL SYNC:</strong> If a "Sniper" lead says <em>"I'm just looking for prices,"</em> use the <strong>💬 Objection Handler</strong> to generate a script that pivots to <strong>"Scientific Safety Inspections"</strong> instead of a price war.</p>
                  </div>
                </div>
              </div>
            </details>
            <details className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-purple-500">
              <summary className="font-bold text-xl text-purple-900 cursor-pointer mb-3 hover:text-purple-700">
                2️⃣ The "Stealth Tag-Team" Strategy <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="font-bold text-purple-800 text-lg">🎯 The Goal: Build a referral network where you aren't competing—you're completing.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                    <p className="text-yellow-800 font-bold">💡 Key Insight:</p>
                    <p className="text-yellow-700 text-sm mt-1">High-intent leads usually buy <strong>two things at once.</strong> If someone gets a new roof, they often need new gutters. If they get an EV, they need a charger.</p>
                  </div>

                  {/* Trade-Specific Tag-Team Partners */}
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700 text-lg">🤝 Partner Up for "Sniper" Alerts:</strong>
                    <div className="space-y-3 mt-3">
                      <div className="bg-yellow-50 p-3 rounded-lg flex items-start gap-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <p className="font-bold text-yellow-800 text-sm">Electricians → Tag-team with Solar Sales Reps or Hot Tub Dealers</p>
                          <p className="text-slate-700 text-sm mt-1"><strong>The Move:</strong> When the Solar guy finds a homeowner with an outdated panel, he "snipes" you in.</p>
                        </div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg flex items-start gap-3">
                        <span className="text-2xl">🏠</span>
                        <div>
                          <p className="font-bold text-orange-800 text-sm">Roofers → Tag-team with Gutter Cleaners or Window Washers</p>
                          <p className="text-slate-700 text-sm mt-1"><strong>The Move:</strong> When the Gutter Cleaner sees loose shingles from the ladder, he takes a photo and "snipes" you in.</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3">
                        <span className="text-2xl">🌡️</span>
                        <div>
                          <p className="font-bold text-blue-800 text-sm">HVAC → Tag-team with Insulation Contractors or Duct Cleaners</p>
                          <p className="text-slate-700 text-sm mt-1"><strong>The Move:</strong> If the Insulation guy sees a leaking AC line in the attic, he pings you.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700">📝 The "Tag-Team" Script:</strong>
                    <div className="bg-purple-50 p-4 rounded mt-2 border-l-4 border-purple-500">
                      <p className="text-purple-800 italic">"Hey [Neighbor Name], I saw [Partner Name] was just out at your place. He noticed your [Problem] and mentioned it might be worth a quick look. I'm actually in the neighborhood today—want me to swing by and give you a <strong>free scientific diagnostic?</strong>"</p>
                    </div>
                  </div>

                  <div>
                    <strong className="text-green-700">🔄 The Online Loop:</strong>
                    <p className="mt-1 text-slate-700">When a happy customer tags you in a group post, reply with:</p>
                    <div className="bg-green-50 p-3 rounded mt-2 border-l-4 border-green-500">
                      <p className="text-green-800 italic">"Thanks for the shoutout! Happy to help anytime."</p>
                    </div>
                    <p className="text-green-700 text-sm mt-2 font-bold">✅ This makes you look like a community favorite, not a solicitor!</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 mt-3">
                    <p className="text-blue-800 text-sm"><strong>💡 SNIPER TIP:</strong> When you use the <strong>⭐ Review Maximizer</strong> for a 5-star customer, add this "P.S." to the thank-you text it generates:</p>
                    <div className="bg-white p-2 rounded mt-2 border-l-4 border-purple-500">
                      <p className="text-purple-800 text-xs italic">"P.S. If you ever see someone asking for a [Service] in the [Neighborhood Name] Facebook group, a quick tag of our page would mean the world to us!"</p>
                    </div>
                    <p className="text-blue-700 text-xs mt-2">💡 Why? This seeds your "Sniper Team" with every happy customer you finish.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Strategy 3: Educational First Response */}
            <details className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl mb-4 border-2 border-blue-500">
              <summary className="font-bold text-xl text-blue-900 cursor-pointer mb-3 hover:text-blue-700">
                3️⃣ The "Educational First" Response <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800 text-lg">🎯 The Goal: Prove expertise before pitching.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="bg-red-50 p-3 rounded border-l-4 border-red-500">
                    <p className="text-red-800 font-bold">❌ What NOT to do:</p>
                    <p className="text-red-700 text-sm mt-1">If you must respond directly, do NOT just post your phone number. That's spam.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">✅ The Strategy:</strong>
                    <p className="mt-1 text-slate-700">Give them a <strong>"Micro-Consult"</strong> in the comments to prove expertise.</p>
                    <p className="mt-2 text-slate-700">Give them a <strong>"Job 1" task</strong> to do immediately:</p>
                    <div className="bg-blue-50 p-3 rounded mt-2">
                      <p className="text-blue-800 italic text-sm">"First thing—turn off your main water shut-off valve (usually near your water heater or in the basement). That'll stop the flooding while you wait for help. Happy to take a look if you need someone—just DM me!"</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">💡 Why This Works:</strong>
                    <ul className="mt-2 text-green-700 text-sm space-y-1">
                      <li>✅ Provides value FIRST</li>
                      <li>✅ Proves you are an expert</li>
                      <li>✅ Shows you are a "good neighbor"</li>
                      <li>✅ Doesn't trigger spam filters or get you banned</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 mt-3">
                    <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Run a recent job through the <strong>🎬 Video Script Command Center</strong>. Each script follows a Problem → Solution → CTA structure — adapt those angles into 2-sentence group comments that prove you're the expert. (e.g., Script #5 "Educational Tips" gives you the exact warning signs to mention.)</p>
                    <p className="text-blue-700 text-xs mt-2"><strong>💡 The Rule:</strong> The first person to provide a solution (like how to find the shut-off valve) wins the job 70% of the time, regardless of price.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Strategy 4: Personal Profile Optimization */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl mb-4 border-2 border-yellow-500">
              <summary className="font-bold text-xl text-yellow-900 cursor-pointer mb-3 hover:text-yellow-700">
                4️⃣ Personal Profile Optimization <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800 text-lg">🎯 The Goal: Turn your personal profile into a digital business card.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                    <p className="text-blue-800 font-bold">💡 Key Truth:</p>
                    <p className="text-blue-700 text-sm mt-1">When you comment, people will click your name to see if you're legit. Today, your personal profile is your digital business card.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-yellow-700">🖼️ The Banner Trick:</strong>
                    <p className="mt-1 text-slate-700">Set your personal cover photo to a <strong>high-quality image of your branded truck</strong>.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-yellow-700">📝 The Intro Bio:</strong>
                    <p className="mt-1 text-slate-700">Set your bio to something like:</p>
                    <div className="bg-yellow-50 p-3 rounded mt-2 border-l-4 border-yellow-600">
                      <p className="text-yellow-800 italic">"[Your Trade] Expert | [X]+ Years Experience | Serving [Your Town] neighbors 24/7"</p>
                    </div>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-yellow-700">🔗 The Link:</strong>
                    <p className="mt-1 text-slate-700">Ensure your <strong>"Work" section</strong> links directly to your Business Page.</p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500 mt-3">
                    <p className="text-purple-800 text-sm font-bold">✅ Enable "Professional Mode" on your personal profile (MUST-HAVE)</p>
                    <p className="text-purple-700 text-xs mt-2"><strong>💡 Why?</strong> It allows people to "Follow" you without being "Friends," and it gives you analytics on who is clicking your profile after you comment in a group.</p>
                    <p className="text-purple-600 text-xs mt-1">📋 <a href="https://facebook.com/business/help/professional-mode" target="_blank" className="text-blue-600 underline">Learn how to enable it here</a></p>
                  </div>
                </div>
              </div>
            </details>

            {/* Strategy 5: Local Resource Post */}
            <details className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl mb-4 border-2 border-green-500">
              <summary className="font-bold text-xl text-green-900 cursor-pointer mb-3 hover:text-green-700">
                5️⃣ The "Local Resource" Post <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800 text-lg">🎯 The Goal: Build "Brand Recall" so they come to YOU.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-green-700">📅 The Frequency:</strong>
                    <p className="mt-1 text-slate-700">Once every two weeks, provide a <strong>"Service Announcement"</strong> that isn't a pitch.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-green-700">🎯 The Hack:</strong>
                    <p className="mt-1 text-slate-700">Post a photo of a <strong>common local issue</strong>:</p>
                    <div className="bg-green-50 p-3 rounded mt-2">
                      <p className="text-green-800 text-sm italic">Example: Ice build-up on sump pump discharge pipes during a freeze-thaw cycle, with a tip on how to prevent basement flooding.</p>
                    </div>
                  </div>

                  <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-600">
                    <strong className="text-green-800">✅ The Result:</strong>
                    <p className="mt-1 text-green-700">This builds <strong>"Brand Recall"</strong>. When a basement floods, they won't ask for recommendations—they will <strong>search for the "Pro" who provided the tip.</strong></p>
                  </div>
                </div>
              </div>
            </details>

            {/* The Double-Tap Rule */}
            <div className="bg-gradient-to-r from-red-100 to-orange-100 p-6 rounded-xl mb-6 border-4 border-red-500">
              <h3 className="text-red-900 font-bold text-2xl mb-4">🚨 THE SNIPER'S "DOUBLE-TAP" RULE</h3>

              <div className="bg-white p-4 rounded-lg mb-4">
                <p className="text-red-900 font-bold text-lg text-center mb-3">
                  Today, most group members choose one of the <span className="text-red-600">first three people</span> who comment.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">1️⃣</span>
                    <div>
                      <p className="font-bold text-red-800">Direct Message (DM)</p>
                      <p className="text-slate-700 text-sm">Message the person <strong>immediately</strong> with helpful tips.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">2️⃣</span>
                    <div>
                      <p className="font-bold text-red-800">Comment</p>
                      <p className="text-slate-700 text-sm">Reply to the post saying:</p>
                      <div className="bg-green-50 p-3 rounded mt-2 border-l-4 border-green-500">
                        <p className="text-green-800 italic text-sm">"Just sent you a DM with some tips on how to shut off the water while you wait for a pro!"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg mt-4 border-l-4 border-yellow-500">
                <p className="text-yellow-800 font-bold">💡 Why This Works:</p>
                <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                  <li>✅ Makes you <strong>impossible to miss</strong></li>
                  <li>✅ Shows you're genuinely helpful (DM proves it)</li>
                  <li>✅ Keeps the algorithm happy by avoiding "spammy" links</li>
                  <li>✅ You're the hero, not the salesman</li>
                </ul>
              </div>
            </div>

            {/* Essential Sniper Links */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">🔗 Essential "Sniper" Links</h3>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🎯 Groups Watcher / Devi AI:</strong> <a href="https://devi-ai.com" target="_blank" className="text-blue-600 underline font-bold">devi-ai.com</a> (The lead-gen engine that monitors groups for you)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>👤 Facebook Professional Mode Guide:</strong> <a href="https://facebook.com/business/help/professional-mode" target="_blank" className="text-blue-600 underline">facebook.com/business/help/professional-mode</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🔍 Facebook Group Search (Bookmark this!):</strong></p>
                  <p className="text-xs text-slate-600 font-mono bg-slate-100 p-1 rounded mt-1">facebook.com/groups/[YourGroupID]/search/?q=plumber</p>
                  <p className="text-xs text-slate-500 mt-1">(Replace [YourGroupID] with the group ID and "plumber" with your keywords)</p>
                </div>
              </div>
              <div className="bg-green-50 p-2 rounded mt-3 border-l-4 border-green-400">
                <p className="text-green-800 text-xs"><strong>💡 Pro Tip:</strong> Most of these tools offer <strong>free trials</strong>—test the "Sniper" life for $0 before committing!</p>
              </div>
            </div>

            {/* Roadmap Bridge */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl mb-4 mt-6 border-2 border-indigo-500">
              <h3 className="text-indigo-900 font-bold text-xl mb-3">📅 KEEP THE SNIPER SHARP</h3>
              <p className="text-indigo-800 leading-relaxed">
                Your <strong>📋 30-DAY DOMINATION ROADMAP</strong> schedules weekly "Signal Search" check-ins so you never miss a high-intent lead. The <strong>Saturday 60</strong> monthly review is the perfect time to update your trigger keywords and refresh your group memberships.
              </p>
            </div>

            {/* Bottom Close Button */}
            <div className="text-center mt-6">
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 text-lg">
                ✕ Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AUTHORITY BUILDER MODAL */}
      {activeModal === 'authorityBuilder' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-5xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">🛡️ THE AUTHORITY BUILDER</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-slate-100 to-blue-100 p-6 rounded-xl mb-6 border-2 border-slate-500">
              <h3 className="text-slate-900 font-bold text-2xl mb-3">The "Insurance-Grade" Secret to Winning Bigger Jobs</h3>
              <div className="bg-white/70 p-4 rounded-lg">
                <p className="text-slate-800 leading-relaxed">
                  <strong>The Strategy:</strong> Today, homeowners don't just want a "fixer"—they want a professional who can handle the <strong>"Insurance Headache."</strong> By using these professional standards and tools, you prove that your price is non-negotiable because your work is <strong>scientifically verified.</strong>
                </p>
              </div>
            </div>

            {/* Strategy 1: The Xactimate Edge */}
            <details className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-blue-500" open>
              <summary className="font-bold text-xl text-blue-900 cursor-pointer mb-3 hover:text-blue-700">
                1️⃣ The "Xactimate" Edge <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800 text-lg">🎯 The Goal: Speak the insurance company's language.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">❌ The Problem:</strong>
                    <p className="mt-1 text-slate-700">Most contractors lose money because they "guess" on their pricing or provide a simple flat-rate invoice that insurance adjusters <strong>immediately reject.</strong></p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-green-700">✅ The Hack:</strong>
                    <p className="mt-1 text-slate-700 mb-2">Explicitly state on your website and in your quotes:</p>
                    <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
                      <p className="text-blue-800 italic font-bold">"We use industry-standard pricing software (Xactimate®/Symbility), the same platforms used by 90% of insurance adjusters."</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">🏆 The Win:</strong>
                    <p className="mt-1 text-green-700">This tells the insurance company you speak their language. It ensures your equipment rates are <strong>pre-approved</strong>, making them much less likely to "cut" your invoice.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Strategy 2: The S500 Standard of Care */}
            <details className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-purple-500">
              <summary className="font-bold text-xl text-purple-900 cursor-pointer mb-3 hover:text-purple-700">
                2️⃣ The S500 "Standard of Care" <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="font-bold text-purple-800 text-lg">🎯 The Goal: Have a "Bible" to defend your work.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">❌ The Problem:</strong>
                    <p className="mt-1 text-slate-700">If an insurance company tries to tell you that you don't need that many air movers, you need a <strong>"Bible"</strong> to hit them with.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700">🔑 The Secret:</strong>
                    <p className="mt-1 text-slate-700">Mention the <strong>IICRC S500 Standards</strong> in your documentation.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">📝 The Script:</strong>
                    <div className="bg-purple-50 p-4 rounded mt-2 border-l-4 border-purple-500">
                      <p className="text-purple-800 italic">"Our drying plan follows the IICRC S500 professional standards for water damage restoration to ensure your home is protected from secondary mold growth."</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">🏆 The Result:</strong>
                    <p className="mt-1 text-green-700">Adjusters are trained to follow the S500. When you mention it by name, you are signaling that you are a <strong>high-level expert</strong>, not a "dry-it-and-fly-it" amateur.</p>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500 mt-3">
                    <p className="text-yellow-800 text-sm font-bold mb-2">🛠️ Trade-Specific "Standard of Care" References:</p>
                    <div className="text-yellow-700 text-sm space-y-1">
                      <p>• <strong>Restoration:</strong> IICRC S500 Standards</p>
                      <p>• <strong>Electricians:</strong> NEC (National Electrical Code)</p>
                      <p>• <strong>HVAC:</strong> ASHRAE Standards / Manual J</p>
                      <p>• <strong>Plumbers:</strong> IPC (International Plumbing Code)</p>
                      <p>• <strong>Roofers:</strong> NRCA (National Roofing Contractors Association) or ASCE 7 (Wind Load Standards)</p>
                    </div>
                    <p className="text-yellow-800 text-xs mt-2"><strong>💡 Why This Matters for AI:</strong> When you put these acronyms in your FAQ pages and photo captions, Google's AI categorizes your business as a "Technical Authority" rather than a "General Laborer" — a massive ranking signal for high-budget commercial and residential jobs.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Strategy 3: Scientific Proof - The Diagnostic Map */}
            <details className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl mb-4 border-2 border-red-500">
              <summary className="font-bold text-xl text-red-900 cursor-pointer mb-3 hover:text-red-700">
                3️⃣ Scientific Proof: The Diagnostic Map <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                  <p className="font-bold text-red-800 text-lg">🎯 The Goal: Turn invisible risks into undeniable, billable proof.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">❌ The Problem:</strong>
                    <p className="mt-1 text-slate-700">Homeowners and adjusters often can't <strong>see</strong> why a repair is necessary or why it costs so much. If they can't see it, they try to negotiate the price down.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700 text-lg">🔧 The Trade-Specific "Invisible Proof" Tools:</strong>
                    <div className="space-y-3 mt-3">
                      <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3">
                        <span className="text-2xl">💧</span>
                        <div>
                          <p className="font-bold text-blue-800 text-sm">Restoration</p>
                          <p className="text-slate-700 text-sm">Use a <strong>FLIR Thermal Camera</strong> and <strong>Moisture Meter</strong> to create a Moisture Map showing "blue" cold spots behind dry walls.</p>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg flex items-start gap-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <p className="font-bold text-yellow-800 text-sm">Electrical</p>
                          <p className="text-slate-700 text-sm">Use a <strong>Thermal Imaging Camera</strong> to find "Hot Spots" in a panel or outlet. A photo of a glowing red circuit is undeniable proof of a <strong>Fire Hazard</strong> that requires immediate repair.</p>
                        </div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg flex items-start gap-3">
                        <span className="text-2xl">🌡️</span>
                        <div>
                          <p className="font-bold text-red-800 text-sm">HVAC</p>
                          <p className="text-slate-700 text-sm">Use <strong>Manometers</strong> or <strong>Psychrometers</strong> to capture Static Pressure or Delta-T (Temperature Drop). A photo of a digital reading showing "0.2" airflow is scientific proof that a system is failing, regardless of how it "feels."</p>
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg flex items-start gap-3">
                        <span className="text-2xl">🏠</span>
                        <div>
                          <p className="font-bold text-green-800 text-sm">Roofing</p>
                          <p className="text-slate-700 text-sm">Use <strong>Drone Photography</strong> or <strong>High-Res Macro Lens</strong> for a Sealant Audit. Show the microscopic cracks in flashing or the "granule loss" that isn't visible from the ground.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700">📸 The Action:</strong>
                    <p className="mt-1 text-slate-700">Take the "Scientific Photo" (the glowing wire, the digital pressure reading, or the blue moisture spot) and upload it to the <strong>📸 Before/After Story Generator</strong>.</p>
                    <p className="mt-2 text-slate-600 text-sm italic">💡 The tool can handle "Scientific Overlays"—placing the meter reading photo next to the repair photo for maximum impact.</p>
                  </div>

                  <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                    <p className="text-red-800 text-sm font-bold">📸 The "Originality" Signal:</p>
                    <p className="text-red-700 text-sm mt-1">When uploading these "Scientific Proof" photos to your website, <strong>do not use screenshots.</strong> Upload the original file directly from your camera or FLIR device. Search engines and insurance portals now check for <strong>EXIF data</strong> to verify the photo hasn't been edited. A "clean" original file proves the hazard is real and current — screenshots get flagged as potentially altered.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">📝 The Universal Script:</strong>
                    <div className="bg-blue-50 p-4 rounded mt-2 border-l-4 border-blue-500">
                      <p className="text-blue-800 italic">"Our [Diagnostic/Drying] plan follows the <strong>[NEC/S500/Manual J]</strong> professional standards to ensure your home is protected from <strong>[Fire/Mold/System Failure]</strong>."</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">🏆 The Benefit:</strong>
                    <ul className="mt-2 text-green-700 space-y-1">
                      <li>✅ <strong>Price Protection:</strong> It's hard to argue with a digital meter or a thermal image</li>
                      <li>✅ <strong>Liability Shield:</strong> You are documenting the exact state of the home for your records</li>
                      <li>✅ <strong>The "Expert" Signal:</strong> Amateurs guess; professionals measure. When you show the "Invisible Proof," you immediately outclass the "handyman" competitor</li>
                    </ul>
                  </div>
                </div>
              </div>
            </details>

            {/* Strategy 4: The One-Tap Call Hack */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl mb-4 border-2 border-yellow-500">
              <summary className="font-bold text-xl text-yellow-900 cursor-pointer mb-3 hover:text-yellow-700">
                4️⃣ The "One-Tap" Call Hack (Speed-to-Lead) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800 text-lg">🎯 The Goal: Make it instant for homeowners to call you.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">❌ The Problem:</strong>
                    <p className="mt-1 text-slate-700">When a homeowner is in a crisis, they don't want to fill out a form; they want a <strong>human.</strong></p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">📱 The Format:</strong>
                    <p className="mt-1 text-slate-700">Always type your phone number exactly like this:</p>
                    <div className="bg-blue-50 p-3 rounded mt-2 text-center">
                      <code className="text-blue-800 font-bold text-xl">(555) 555-5555</code>
                    </div>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700">✨ The Magic:</strong>
                    <p className="mt-1 text-slate-700">Smartphones will automatically turn that text into a <strong>clickable link</strong> in Google Chat, Yelp Messages, and Facebook DMs.</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">🏆 The Result:</strong>
                    <p className="mt-1 text-green-700"><strong>One tap = one call.</strong> This 2-second shortcut is often the only reason a homeowner chooses you over the guy who said "Check my website."</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 mt-3">
                    <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Open the <strong>❓ FAQ/Website Content Generator</strong> and type "Insurance FAQ" as your Topic. In the Location field, add your city. <strong>The Secret:</strong> Siri and ChatGPT scan for phrases like "We accept all insurance" and "Direct billing to insurance" when ranking emergency searches — so include those phrases in your Topic or Details to make sure the AI weaves them into your FAQ page.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Pro-Tip for FAQ Page */}
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl mb-6 border-2 border-green-500">
              <h3 className="text-green-900 font-bold text-xl mb-4">💡 Pro-Tip for Your FAQ Page</h3>
              <p className="text-green-800 mb-4">Include a version of this Q&A at the bottom of your site (customized to your trade):</p>

              <div className="bg-white p-4 rounded-lg mb-3">
                <p className="font-bold text-green-900 mb-2">Q: "Do you follow professional industry standards?"</p>
                <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
                  <p className="text-green-800 italic">"Absolutely. With [X]+ years of experience, we follow [your standard — S500/NEC/IPC/NRCA/ASHRAE/Manual J] on every job. We provide the photos, diagnostic readings, and documentation needed to verify our work meets the highest professional benchmarks."</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                <p className="text-yellow-800 text-xs"><strong>💡 Insurance-Heavy Trades:</strong> If you work with adjusters regularly, add: <em>"Will you work directly with my insurance adjuster?"</em> and include phrases like "We accept all insurance" and "Direct billing to insurance" — Siri and ChatGPT scan for these when ranking emergency searches.</p>
              </div>
            </div>

            {/* Essential Authority Links */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">🔗 Essential Authority Links</h3>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>💧 IICRC S500 Standards (Restoration):</strong> <a href="https://iicrc.org/s500" target="_blank" className="text-blue-600 underline font-bold">iicrc.org/s500</a> (The "Bible" for water damage pros)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>⚡ NEC Code Lookup (Electrical):</strong> <a href="https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" target="_blank" className="text-blue-600 underline font-bold">nfpa.org/nec</a> (National Electrical Code reference)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🌡️ ASHRAE Standards (HVAC):</strong> <a href="https://www.ashrae.org/technical-resources/standards-and-guidelines" target="_blank" className="text-blue-600 underline font-bold">ashrae.org/standards</a> (Heating, cooling & ventilation benchmarks)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🔧 IPC Code (Plumbing):</strong> <a href="https://codes.iccsafe.org/content/IPC2021P7" target="_blank" className="text-blue-600 underline font-bold">codes.iccsafe.org/IPC</a> (International Plumbing Code)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🏠 NRCA Resources (Roofing):</strong> <a href="https://www.nrca.net/technical" target="_blank" className="text-blue-600 underline font-bold">nrca.net/technical</a> (National Roofing Contractors Association)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>💰 Xactimate / Symbility:</strong> <a href="https://xactware.com" target="_blank" className="text-blue-600 underline">xactware.com</a> (Industry-standard insurance pricing software)</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700"><strong>🏆 BBB Accreditation:</strong> <a href="https://bbb.org/apply" target="_blank" className="text-blue-600 underline">bbb.org/apply</a> (Still a major trust signal for high-end homeowners)</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-2 rounded mt-3 border-l-4 border-yellow-400">
                <p className="text-yellow-800 text-xs"><strong>💡 Quick Tip:</strong> Bookmark your trade's standard — you'll reference it during the FAQ Generator, photo captions, and any time a customer questions your pricing.</p>
              </div>
            </div>

            {/* The Anti-Scrub Checklist */}
            <div className="bg-gradient-to-r from-red-100 to-orange-100 p-6 rounded-xl mb-6 border-4 border-red-500">
              <h3 className="text-red-900 font-bold text-2xl mb-4">🛡️ THE "ANTI-SCRUB" CHECKLIST</h3>
              <p className="text-red-800 mb-4 font-semibold">Do on EVERY job to make your invoices AI-proof:</p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-red-800">Date/Time Stamped Photos</p>
                    <p className="text-sm text-red-700">Of the problem area before you touch it (all trades)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-red-800">Diagnostic Readings / Logs</p>
                    <p className="text-sm text-red-700">💧 Restoration: Moisture logs (Day 1, Day 2, Dry Goal) &nbsp;|&nbsp; ⚡ Electrical: Voltage/amp readings &nbsp;|&nbsp; 🌡️ HVAC: Static pressure / Delta-T &nbsp;|&nbsp; 🔧 Plumbing: Pressure test results &nbsp;|&nbsp; 🏠 Roofing: Drone survey photos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-red-800">Digital Meter Proof</p>
                    <p className="text-sm text-red-700">A photo of your manometer, psychrometer, multimeter, or pressure gauge showing the "Before" vs "After" readings. This is the "Scientific Close" that stops a customer from saying "I don't think it's fixed yet."</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-red-800">Sketch / Dimensions / Scope</p>
                    <p className="text-sm text-red-700">Accurate measurements prevent disputes — floor plans (restoration), panel diagrams (electrical), load calcs (HVAC), roof area (roofing)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-red-800">Code / Standard Reference</p>
                    <p className="text-sm text-red-700">Note which standard your work follows (S500, NEC, IPC, NRCA, ASHRAE) — this makes your invoice defensible</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg mt-3 border-l-4 border-yellow-500">
                <p className="text-yellow-800 text-xs"><strong>💡 Pro Tip:</strong> Ensure your photos have <strong>Metadata (Geotags) enabled</strong>. Insurance AI checks the "where and when" of every photo to verify you aren't using old job photos to pad a new claim.</p>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg mt-4 border-l-4 border-green-500">
                <p className="text-green-900 font-bold text-lg text-center">
                  🏆 Result: An invoice that is <span className="text-green-700">impossible for an insurance AI to reject!</span>
                </p>
              </div>
            </div>

            {/* Roadmap Bridge */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl mb-4 mt-6 border-2 border-indigo-500">
              <h3 className="text-indigo-900 font-bold text-xl mb-3">📅 BUILD AUTHORITY OVER TIME</h3>
              <p className="text-indigo-800 leading-relaxed">
                Your <strong>📋 30-DAY DOMINATION ROADMAP</strong> schedules weekly "Authority Content" tasks — FAQ updates, before/after posts, and diagnostic photo uploads. The <strong>Saturday 60</strong> monthly review is the perfect time to check that your trade standard references are on your website and Google profile.
              </p>
            </div>

            {/* Bottom Close Button */}
            <div className="text-center mt-6">
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 text-lg">
                ✕ Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* COMPETITOR INTEL MODAL */}
      {activeModal === 'competitorIntel' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-5xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">🕵️ COMPETITOR INTEL</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-xl mb-6 border-2 border-slate-600">
              <h3 className="text-white font-bold text-2xl mb-3">Ethical "Spying" to Out-Market & Out-Bid the Competition</h3>
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-slate-200 leading-relaxed">
                  <strong className="text-white">The Mindset:</strong> Stop wondering why the guy down the street is busier than you. These tools give you the <strong className="text-yellow-400">"Spy Glass"</strong> to see their paid keywords, their top-performing ads, and the service gaps their unhappy customers are begging you to fill.
                </p>
              </div>
            </div>

            {/* Strategy 1: Competitor Intel Tool */}
            <details className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-blue-500" open>
              <summary className="font-bold text-xl text-blue-900 cursor-pointer mb-3 hover:text-blue-700">
                1️⃣ The "Competitor Intel Tool" <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800 text-lg">🎯 The Goal: See exactly what keywords your competitors are paying for.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">🔧 The Tools:</strong>
                    <p className="mt-1 text-slate-700">Use <a href="https://www.semrush.com" target="_blank" className="text-blue-600 underline font-bold">Semrush</a>, <a href="https://ahrefs.com" target="_blank" className="text-blue-600 underline font-bold">Ahrefs</a>, or the free <a href="https://www.spyfu.com" target="_blank" className="text-blue-600 underline font-bold">SpyFu</a>.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700">📋 The Action:</strong>
                    <p className="mt-1 text-slate-700">Plug a competitor's URL (e.g., <code className="bg-slate-200 px-2 py-1 rounded">BigCityCompetitor.com</code>) into these tools.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-green-700">🔍 The "Secret" Data You Get:</strong>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-start gap-2 bg-green-50 p-2 rounded">
                        <span className="text-green-600 font-bold">•</span>
                        <p className="text-sm text-slate-700"><strong>Paid Keywords:</strong> See exactly which words they are "buying" on Google (e.g., they might be spending $40/click on "sewer backup" but $0 on "sump pump failure").</p>
                      </div>
                      <div className="flex items-start gap-2 bg-green-50 p-2 rounded">
                        <span className="text-green-600 font-bold">•</span>
                        <p className="text-sm text-slate-700"><strong>Organic Gaps:</strong> See which neighborhoods they rank for and which ones they are losing.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                    <strong className="text-yellow-800">💡 The Move:</strong>
                    <p className="mt-1 text-yellow-700">Look for <strong>"Low Difficulty"</strong> keywords they missed. If they are fighting over broad terms like "Water Damage" or "AC Repair," you go win niche terms like <strong>"Hardwood Floor Drying Specialist"</strong> or <strong>"18-SEER High-Efficiency Install"</strong>—niches they ignored but are high-profit.</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 mt-3">
                    <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Use the <strong>🕵️ Competitor Intel</strong> tool in your dashboard. Plug in their top-performing ad copy. The AI will rewrite it to be "Scientifically Superior" by keeping the proven structure but injecting your local authority and higher standards.</p>
                    <p className="text-blue-700 text-xs mt-2"><strong>💡 Pro Tip:</strong> Use SpyFu to look at their "Top Ad Competitors." Often, the smartest guy in the market isn't the biggest company, but a small "Sniper" firm. Study them.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Strategy 2: Facebook Ad Library (Meta) Deep-Dive */}
            <details className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-purple-500">
              <summary className="font-bold text-xl text-purple-900 cursor-pointer mb-3 hover:text-purple-700">
                2️⃣ The "Facebook Ad Library (Meta)" Deep-Dive <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="font-bold text-purple-800 text-lg">🎯 The Goal: See which Facebook/Instagram ads are making your competitors money.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-purple-700">🔧 The Tool:</strong>
                    <p className="mt-1 text-slate-700">Go to <a href="https://www.facebook.com/ads/library" target="_blank" className="text-purple-600 underline font-bold">Facebook Ad Library (Meta)</a> and search for your competitors.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">🔍 The Intel:</strong>
                    <p className="mt-1 text-slate-700">Don't just look at the ads; look at the <strong>Active Date.</strong></p>
                    <div className="bg-purple-50 p-3 rounded mt-2 border-l-4 border-purple-500">
                      <p className="text-purple-800 italic">If an ad has been running for more than <strong>3 months</strong>, it is making them money.</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">🏆 The Move:</strong>
                    <p className="mt-1 text-green-700"><strong>Don't copy it—improve the "Hook."</strong></p>
                    <p className="mt-2 text-green-700 text-sm">If their ad says "Free Inspection," and it's been running all year, you know homeowners want inspections. Your ad should be: <strong>"The 30-Point Scientific Safety Inspection"</strong> (Specific beats General).</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Strategy 3: Review Mining Script */}
            <details className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl mb-4 border-2 border-red-500">
              <summary className="font-bold text-xl text-red-900 cursor-pointer mb-3 hover:text-red-700">
                3️⃣ The "Review Mining" Script (The Franchise Killer) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                  <p className="font-bold text-red-800 text-lg">🎯 The Goal: Find the weaknesses customers are complaining about.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                    <p className="text-yellow-800 font-bold">💡 Key Insight:</p>
                    <p className="text-yellow-700 text-sm mt-1">Big franchises in your trade usually have 1-star reviews complaining about <strong>Communication</strong> and <strong>Sub-Contractors.</strong></p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-red-700">📋 The Action:</strong>
                    <p className="mt-1 text-slate-700">Go to their 1-star reviews and look for recurring words like:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-red-100 px-3 py-1 rounded text-red-800 text-sm">"didn't call back"</span>
                      <span className="bg-red-100 px-3 py-1 rounded text-red-800 text-sm">"technician was rude"</span>
                      <span className="bg-red-100 px-3 py-1 rounded text-red-800 text-sm">"took 3 weeks to start"</span>
                      <span className="bg-red-100 px-3 py-1 rounded text-red-800 text-sm">"no communication"</span>
                    </div>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-green-700">🏆 The Move (The "Us vs. Them" Chart):</strong>
                    <p className="mt-1 text-slate-700 mb-2">On your website, add a small section or a graphic:</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-red-100 p-3 rounded">
                        <p className="font-bold text-red-800 text-sm mb-1">❌ The Other Guys:</p>
                        <ul className="text-red-700 text-xs space-y-1">
                          <li>• National call centers</li>
                          <li>• Random sub-contractors</li>
                          <li>• 48-hour call backs</li>
                        </ul>
                      </div>
                      <div className="bg-green-100 p-3 rounded">
                        <p className="font-bold text-green-800 text-sm mb-1">✅ [Your Company]:</p>
                        <ul className="text-green-700 text-xs space-y-1">
                          <li>• Local owner-operated</li>
                          <li>• Certified & licensed crew</li>
                          <li>• Live person in 3 rings</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 mt-3">
                    <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Paste a competitor's most common 1-star complaint into the <strong>💬 Objection Handler</strong> as the "Objection" (e.g., "They had hidden fees and were impossible to reach"). The tool generates <strong>Quick Comeback Phrases</strong> you can use as marketing bullet points that position you as the opposite of their biggest weakness.</p>
                    <div className="bg-white p-2 rounded mt-2 border-l-4 border-green-500">
                      <p className="text-green-800 text-xs"><strong>🏆 Example:</strong> If customers complain about "hidden fees" at a franchise competitor, the Quick Comebacks will give you lines like: <em>"What we bid is what you pay — no surprise equipment fees, ever."</em></p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border-2 border-purple-400 mt-3">
                    <p className="text-purple-800 text-sm font-bold mb-2">🤖 PRO-TIP: The "Sentiment Gap"</p>
                    <p className="text-purple-700 text-sm">AI-powered search engines (like Gemini/SGE) now prioritize businesses that explicitly mention fixing <strong>"Common Industry Complaints."</strong></p>
                    <p className="text-purple-800 text-sm mt-2"><strong>The Move:</strong> If competitors are getting hit for "Bad Communication," add the phrase <strong>"Instant Project Updates via Text"</strong> to your GBP "Services" description. Google's AI will see the complaint on their profile and the solution on yours — and favor you in the rankings.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Strategy 4: Ghost Shopping Call */}
            <details className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl mb-4 border-2 border-green-500">
              <summary className="font-bold text-xl text-green-900 cursor-pointer mb-3 hover:text-green-700">
                4️⃣ The "Ghost Shopping" Call (Audio Intel) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800 text-lg">🎯 The Goal: Discover how your competitors handle phone calls.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-green-700">📋 The Action:</strong>
                    <p className="mt-1 text-slate-700">Have a friend call 3 competitors and ask for a quote on a standard job (like an AC tune-up, roof inspection, or basement pump-out).</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">🔍 The Intel - Listen for:</strong>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Do they sound bored?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Do they try to "scare" the customer?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>How long does it take for them to send a written estimate?</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                    <strong className="text-green-800">🏆 The Move:</strong>
                    <p className="mt-1 text-green-700">If they take 24 hours to send an estimate, your goal is to send a <strong>Professional PDF Estimate via Text within 15 minutes</strong> of the site visit.</p>
                    <p className="mt-2 text-green-700 font-bold">Speed is a competitive advantage.</p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500 mt-3">
                    <p className="text-purple-800 text-sm font-bold">📱 The "Speed Signal":</p>
                    <p className="text-purple-700 text-sm mt-1">If your competitor uses an automated "Press 1 for Sales" menu and you answer with a <strong>live local human</strong>, mention that in your Facebook (Meta) Intro: <strong>"Skip the robots — talk to a local owner in 3 rings or less."</strong> In a world of AI, "Human-to-Human" is a premium luxury.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Strategy 5: Loom Stealth Audit */}
            <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl mb-4 border-2 border-yellow-500">
              <summary className="font-bold text-xl text-yellow-900 cursor-pointer mb-3 hover:text-yellow-700">
                5️⃣ The "Loom" Stealth Audit <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800 text-lg">🎯 The Goal: Position yourself as the educated authority.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-500">
                    <p className="text-purple-800 font-bold">💡 This is a high-level advanced move for the Authority Builder.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-yellow-700">📋 The Action:</strong>
                    <p className="mt-1 text-slate-700">Use a screen recorder (like <a href="https://www.loom.com" target="_blank" className="text-yellow-600 underline font-bold">Loom</a>) to record yourself looking at a competitor's website or a common "bad advice" article they posted.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-blue-700">🏆 The Move:</strong>
                    <p className="mt-1 text-slate-700">Post the video to your Facebook/LinkedIn:</p>
                    <div className="bg-yellow-50 p-3 rounded mt-2 border-l-4 border-yellow-500">
                      <p className="text-yellow-800 italic">"I saw a local company giving dangerous advice online. Here is why that's risky for your family and what the industry standard actually says."</p>
                    </div>
                    <p className="text-slate-600 text-xs mt-2 italic">Examples: 💧 "Just 'bleach' mold" → explain EPA-registered disinfectants | ⚡ "DIY panel work" → explain NEC code requirements | 🌡️ "Any refrigerant will do" → explain EPA 608 regulations</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800">🏆 The Result:</strong>
                    <p className="mt-1 text-green-700">You aren't just "better"; you are the <strong>Educated Authority</strong> that makes them look like amateurs.</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 mt-3">
                    <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Describe your audit findings as the "Job Details" in the <strong>🎬 Video Script Command Center</strong> (e.g., "Found competitor cutting corners on [specific issue] — showed homeowner the industry-standard approach"). Script #1 (Before/After, 60s) or Script #8 (Pattern Interrupt, 15s) will turn it into a ready-to-film hook.</p>
                    <div className="bg-white p-2 rounded mt-2 border-l-4 border-yellow-500">
                      <p className="text-yellow-800 text-xs italic"><strong>Script Hook Example:</strong> "I just saw a 'Pro' give a homeowner advice that violates [NEC/S500/IPC/NRCA] standards. That's like putting a Band-Aid on a bullet wound. Here is the science they aren't telling you..."</p>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* Strategy 6: The AI Overview Spy */}
            <details className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl mb-4 border-2 border-cyan-500">
              <summary className="font-bold text-xl text-cyan-900 cursor-pointer mb-3 hover:text-cyan-700">
                6️⃣ The "AI Overview" Spy (Strategy) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-cyan-500">
                  <p className="font-bold text-cyan-800 text-lg">🎯 The Goal: See who Google's AI is recommending instead of you.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="bg-red-50 p-3 rounded border-l-4 border-red-500">
                    <p className="text-red-800 font-bold">⚠️ The Threat:</p>
                    <p className="text-red-700 text-sm mt-1">Today, the biggest threat isn't just a competitor's website—it's them being cited as the <strong>"Source"</strong> in a Google AI Overview (SGE). If Google's AI recommends them, you're invisible.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-cyan-700">💡 The "Citation" Move:</strong>
                    <p className="mt-1 text-slate-700">Go to Google and ask:</p>
                    <div className="bg-cyan-50 p-3 rounded mt-2 border-l-4 border-cyan-500">
                      <p className="text-cyan-800 italic font-bold">"Who is the most qualified [your trade] company in [Your City]?"</p>
                    </div>
                    <p className="mt-2 text-slate-700">If an AI Overview pops up and mentions a competitor, look at the links it provides as proof sources.</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Look at the <strong>"Source Cards"</strong> in the AI Overview. If a competitor is cited, click the link to see their "Blog" or "FAQ" structure. Then open the <strong>❓ FAQ/Website Content Generator</strong> — type that same topic with your city in the Location field. <strong>The Key:</strong> Make your page <strong>20% longer</strong> and include <strong>1 additional local landmark</strong> than theirs. Google's "Freshness" algorithm will likely swap their citation for yours within 30 days.</p>
                    <p className="text-blue-700 text-xs mt-2"><strong>🏆 The Result:</strong> You reverse-engineer Google's AI to cite <strong>you</strong> next time.</p>
                  </div>
                </div>
              </div>
            </details>

            {/* Strategy 7: The Visual Spy */}
            <details className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl mb-4 border-2 border-pink-500">
              <summary className="font-bold text-xl text-pink-900 cursor-pointer mb-3 hover:text-pink-700">
                7️⃣ The "Visual Spy" (Review Photo Intel) <span className="text-sm font-normal italic">(Click to expand)</span>
              </summary>

              <div className="mt-4 space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-pink-500">
                  <p className="font-bold text-pink-800 text-lg">🎯 The Goal: Mine competitor review PHOTOS for marketing gold.</p>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-4">
                  <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                    <p className="text-yellow-800 font-bold">💡 Key Insight:</p>
                    <p className="text-yellow-700 text-sm mt-1">Contractors often overlook the <strong>photos</strong> in 1-star reviews. These are visual proof of your competitor's failures.</p>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-pink-700">🔍 The "Photo" Intel:</strong>
                    <p className="mt-1 text-slate-700">Look at the photos customers post in 1-star reviews of franchises. They often show:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-red-100 px-3 py-1 rounded text-red-800 text-sm">Workers without shoe covers</span>
                      <span className="bg-red-100 px-3 py-1 rounded text-red-800 text-sm">Messy equipment in hallways</span>
                      <span className="bg-red-100 px-3 py-1 rounded text-red-800 text-sm">Unprotected furniture</span>
                      <span className="bg-red-100 px-3 py-1 rounded text-red-800 text-sm">Dirty work vans</span>
                    </div>
                  </div>

                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-green-700">🏆 The Move:</strong>
                    <p className="mt-1 text-slate-700">Take a photo of <strong>your team doing the opposite</strong> (using floor protection, organized vans, shoe covers on).</p>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                    <p className="text-yellow-800 text-sm font-bold">🛡️ The "Authority" Frame:</p>
                    <p className="text-yellow-700 text-sm mt-1">When you take the photo of your "Clean Job Site," place your <strong>trade certification</strong> (IICRC, Master Electrician, EPA 608, NRCA, etc.) visibly in the frame. It proves your cleanliness isn't just a choice — it's a <strong>professional standard</strong> that the "Other Guys" are ignoring.</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="text-blue-800 text-sm"><strong>💡 VISUAL SPY TIP:</strong> Run your "doing it right" photo through the <strong>📸 Before/After Story Generator</strong> to get captions and alt-text. Then add this angle to your job description so the AI weaves it in:</p>
                    <div className="bg-white p-2 rounded mt-2 border-l-4 border-green-500">
                      <p className="text-green-800 text-xs italic">"We saw the horror stories of messy job sites in our city. That's why we use the 3-point floor protection system on every single call."</p>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* Essential Spy Links */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 rounded-xl mb-4 border-2 border-slate-500">
              <h3 className="text-white font-bold text-xl mb-3">🔗 Essential "Spy" Links</h3>
              <div className="space-y-2">
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-sm text-slate-200"><strong className="text-yellow-400">🔍 SpyFu:</strong> <a href="https://spyfu.com" target="_blank" className="text-blue-400 underline font-bold">spyfu.com</a> (The "Budget King" for seeing their exact Google Ad spend history)</p>
                </div>
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-sm text-slate-200"><strong className="text-yellow-400">📱 Facebook Ad Library (Meta):</strong> <a href="https://facebook.com/ads/library" target="_blank" className="text-blue-400 underline">facebook.com/ads/library</a> (Total transparency into their current social media tests)</p>
                </div>
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-sm text-slate-200"><strong className="text-yellow-400">📍 Local Falcon:</strong> <a href="https://localfalcon.com" target="_blank" className="text-blue-400 underline font-bold">localfalcon.com</a> (A "Map Grid" tool that shows exactly where a competitor's ranking "drops off" in a 5-mile radius—target those neighborhoods with your 🏘️ Neighborhood Sniper)</p>
                </div>
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-sm text-slate-200"><strong className="text-yellow-400">🌐 SimilarWeb:</strong> <a href="https://similarweb.com" target="_blank" className="text-blue-400 underline">similarweb.com</a> (See where their traffic comes from—is it Google, or are they buying leads from Angi?)</p>
                </div>
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-sm text-slate-200"><strong className="text-yellow-400">🎬 Loom:</strong> <a href="https://loom.com" target="_blank" className="text-blue-400 underline">loom.com</a> (For the "Authority" video audits)</p>
                </div>
              </div>
            </div>

            {/* Saturday 60 Bridge */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl mb-4 border-2 border-indigo-500">
              <h3 className="text-indigo-900 font-bold text-xl mb-3">📅 ONGOING INTEL</h3>
              <p className="text-indigo-800 leading-relaxed">
                Your <strong>📋 30-DAY DOMINATION ROADMAP</strong> schedules a "Competitor Sweep" on the 3rd Saturday of every month. Markets change—this ensures you see when a new competitor pops up or an old one changes their pricing.
              </p>
              <p className="text-indigo-700 text-sm mt-2 italic">
                💡 The best intel is fresh intel. Don't set it and forget it—sweep monthly!
              </p>
            </div>

            {/* Bottom Close Button */}
            <div className="text-center mt-6">
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 text-lg">
                ✕ Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ROI CALCULATOR MODAL */}
      {activeModal === 'roiCalculator' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-5xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">🎯 ROI CALCULATOR</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* INTRO */}
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl mb-6 border-2 border-green-500">
              <h3 className="text-green-900 font-bold text-xl mb-3">💰 See Exactly Which Channels Are Making (or Losing) You Money</h3>
              <div className="text-green-900 leading-relaxed space-y-2">
                <p><strong>No AI needed — pure math.</strong> Input your monthly spend and leads per channel. Get instant cost-per-lead, cost-per-job, and ROI rankings.</p>
                <p className="mt-3 font-semibold">🎯 The goal: Double down on what works. Cut what doesn't. Stop guessing.</p>
              </div>
            </div>

            {/* CALCULATOR */}
            {(() => {
              const channels = [
                { key: 'gbp', name: 'Google Business Profile', icon: '📍', defaultCost: 0 },
                { key: 'fbOrganic', name: 'Facebook (Meta) Organic', icon: '📘', defaultCost: 0 },
                { key: 'fbAds', name: 'Facebook (Meta) Ads', icon: '💰', defaultCost: 0 },
                { key: 'googleAds', name: 'Google Ads', icon: '🔍', defaultCost: 0 },
                { key: 'nextdoor', name: 'Nextdoor', icon: '🏘️', defaultCost: 0 },
                { key: 'yelp', name: 'Yelp', icon: '⭐', defaultCost: 0 },
                { key: 'referrals', name: 'Referrals', icon: '🤝', defaultCost: 0 },
                { key: 'guerrilla', name: 'Guerrilla / Offline', icon: '🥷', defaultCost: 0 }
              ];

              const [roiData, setRoiData] = React.useState(
                channels.reduce((acc, ch) => ({
                  ...acc,
                  [ch.key]: { spend: '', leads: '', jobs: '' }
                }), {})
              );
              const [avgJobValue, setAvgJobValue] = React.useState('');
              const [roiResults, setRoiResults] = React.useState(null);

              const calculateROI = () => {
                const jobVal = parseFloat(avgJobValue) || 0;
                const results = channels.map(ch => {
                  const spend = parseFloat(roiData[ch.key].spend) || 0;
                  const leads = parseInt(roiData[ch.key].leads) || 0;
                  const jobs = parseInt(roiData[ch.key].jobs) || 0;
                  const costPerLead = leads > 0 ? spend / leads : null;
                  const costPerJob = jobs > 0 ? spend / jobs : null;
                  const closeRate = leads > 0 ? ((jobs / leads) * 100) : null;
                  const revenue = jobs * jobVal;
                  const roi = spend > 0 ? (((revenue - spend) / spend) * 100) : (revenue > 0 ? Infinity : null);
                  return { ...ch, spend, leads, jobs, costPerLead, costPerJob, closeRate, revenue, roi };
                }).filter(r => r.leads > 0 || r.spend > 0);

                results.sort((a, b) => {
                  if (a.costPerLead === null) return 1;
                  if (b.costPerLead === null) return -1;
                  return a.costPerLead - b.costPerLead;
                });
                setRoiResults(results);
              };

              const getRecommendation = (r) => {
                if (r.spend === 0 && r.leads > 0) return { text: '🏆 FREE GOLD — This channel costs you nothing and generates leads!', color: 'text-green-700 bg-green-50' };
                if (r.costPerLead !== null && r.costPerLead < 20) return { text: '🟢 DOUBLE DOWN — Excellent cost per lead. Increase budget here.', color: 'text-green-700 bg-green-50' };
                if (r.costPerLead !== null && r.costPerLead < 50) return { text: '🟡 WATCH — Decent performance. Optimize before scaling.', color: 'text-yellow-700 bg-yellow-50' };
                if (r.costPerLead !== null && r.costPerLead < 100) return { text: '🟠 CAUTION — Expensive leads. Test new ad copy or targeting.', color: 'text-orange-700 bg-orange-50' };
                if (r.costPerLead !== null) return { text: '🔴 CUT OR FIX — Costly channel. Reduce spend or overhaul strategy.', color: 'text-red-700 bg-red-50' };
                if (r.spend > 0 && r.leads === 0) return { text: '🚨 MONEY PIT — Spending with zero leads. Stop or completely rework.', color: 'text-red-700 bg-red-100' };
                return { text: '⚪ No data yet', color: 'text-slate-500 bg-slate-50' };
              };

              const getCloseRateAlert = (r) => {
                if (r.closeRate === null) return null;
                if (r.closeRate < 15) return { text: `⚠️ Close rate is only ${r.closeRate.toFixed(0)}% — check your follow-up speed and process`, color: 'text-red-600' };
                if (r.closeRate < 30) return { text: `📊 Close rate at ${r.closeRate.toFixed(0)}% — room to improve with faster response times`, color: 'text-yellow-600' };
                return null;
              };

              return (
                <div>
                  {/* AVG JOB VALUE */}
                  <div className="bg-blue-50 p-5 rounded-xl mb-6 border-2 border-blue-400">
                    <label className="font-bold text-blue-900 text-lg block mb-2">💵 Your Average Job Value ($)</label>
                    <input
                      type="number"
                      placeholder="e.g., 500"
                      value={avgJobValue}
                      onChange={(e) => setAvgJobValue(e.target.value)}
                      className="w-full md:w-64 p-3 border-2 border-blue-300 rounded-lg text-lg"
                    />
                    <p className="text-blue-700 text-sm mt-2">What's your average invoice per completed job?</p>
                  </div>

                  {/* CHANNEL INPUTS */}
                  <div className="space-y-3 mb-6">
                    <h3 className="font-bold text-lg text-slate-800">📊 Enter Last Month's Numbers Per Channel:</h3>
                    {channels.map(ch => (
                      <div key={ch.key} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="font-bold text-slate-800 mb-2">{ch.icon} {ch.name}</div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-slate-600 block mb-1">Monthly Spend ($)</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={roiData[ch.key].spend}
                              onChange={(e) => setRoiData(prev => ({...prev, [ch.key]: {...prev[ch.key], spend: e.target.value}}))}
                              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-600 block mb-1">Leads Generated</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={roiData[ch.key].leads}
                              onChange={(e) => setRoiData(prev => ({...prev, [ch.key]: {...prev[ch.key], leads: e.target.value}}))}
                              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-600 block mb-1">Jobs Booked</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={roiData[ch.key].jobs}
                              onChange={(e) => setRoiData(prev => ({...prev, [ch.key]: {...prev[ch.key], jobs: e.target.value}}))}
                              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CALCULATE BUTTON */}
                  <div className="text-center mb-6">
                    <button
                      onClick={calculateROI}
                      className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-10 py-4 rounded-xl font-bold text-xl hover:from-green-700 hover:to-emerald-800 shadow-lg"
                    >
                      🎯 Calculate My ROI
                    </button>
                  </div>

                  {/* RESULTS */}
                  {roiResults && roiResults.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-2xl text-slate-900 text-center mb-4">📊 Your Channel Rankings (Best → Worst)</h3>

                      {roiResults.map((r, idx) => {
                        const rec = getRecommendation(r);
                        const closeAlert = getCloseRateAlert(r);
                        return (
                          <div key={r.key} className={`p-5 rounded-xl border-2 ${idx === 0 ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white'}`}>
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-bold text-lg">{idx === 0 ? '🏆' : `#${idx + 1}`} {r.icon} {r.name}</span>
                              {r.costPerLead !== null && (
                                <span className={`font-bold text-lg ${r.costPerLead < 20 ? 'text-green-600' : r.costPerLead < 50 ? 'text-yellow-600' : r.costPerLead < 100 ? 'text-orange-600' : 'text-red-600'}`}>
                                  ${r.costPerLead.toFixed(2)}/lead
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                              <div className="bg-slate-100 p-2 rounded-lg text-center">
                                <div className="text-xs text-slate-500">Spend</div>
                                <div className="font-bold">${r.spend.toLocaleString()}</div>
                              </div>
                              <div className="bg-slate-100 p-2 rounded-lg text-center">
                                <div className="text-xs text-slate-500">Leads</div>
                                <div className="font-bold">{r.leads}</div>
                              </div>
                              <div className="bg-slate-100 p-2 rounded-lg text-center">
                                <div className="text-xs text-slate-500">Cost/Job</div>
                                <div className="font-bold">{r.costPerJob !== null ? `$${r.costPerJob.toFixed(2)}` : '—'}</div>
                              </div>
                              <div className="bg-slate-100 p-2 rounded-lg text-center">
                                <div className="text-xs text-slate-500">Revenue</div>
                                <div className="font-bold text-green-600">${r.revenue.toLocaleString()}</div>
                              </div>
                            </div>
                            <div className={`p-3 rounded-lg text-sm font-semibold ${rec.color}`}>
                              {rec.text}
                            </div>
                            {closeAlert && (
                              <div className={`mt-2 p-2 rounded-lg text-xs font-semibold ${closeAlert.color}`}>
                                {closeAlert.text}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* SUMMARY */}
                      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-xl text-white mt-6">
                        <h4 className="font-bold text-xl mb-3">📋 Quick Summary</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Total Monthly Spend:</strong> ${roiResults.reduce((s, r) => s + r.spend, 0).toLocaleString()}</p>
                          <p><strong>Total Leads:</strong> {roiResults.reduce((s, r) => s + r.leads, 0)}</p>
                          <p><strong>Total Jobs Booked:</strong> {roiResults.reduce((s, r) => s + r.jobs, 0)}</p>
                          <p><strong>Total Revenue:</strong> <span className="text-green-400">${roiResults.reduce((s, r) => s + r.revenue, 0).toLocaleString()}</span></p>
                          <p><strong>Overall ROI:</strong> {(() => {
                            const totalSpend = roiResults.reduce((s, r) => s + r.spend, 0);
                            const totalRevenue = roiResults.reduce((s, r) => s + r.revenue, 0);
                            if (totalSpend === 0) return 'Free leads only — infinite ROI!';
                            const overallRoi = ((totalRevenue - totalSpend) / totalSpend * 100).toFixed(0);
                            return <span className={parseInt(overallRoi) > 0 ? 'text-green-400' : 'text-red-400'}>{overallRoi}%</span>;
                          })()}</p>
                        </div>
                      </div>

                      {/* TOOL SYNC */}
                      <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500 mt-4">
                        <p className="text-purple-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Use these results with your <strong>📊 Analytics Dashboard Guide</strong> to track the "Big 5" metrics per channel. Your best-performing channel deserves the most content from <strong>🔥 One Job = One Week of Content</strong>.</p>
                      </div>
                    </div>
                  )}

                  {roiResults && roiResults.length === 0 && (
                    <div className="text-center p-8 bg-yellow-50 rounded-xl border-2 border-yellow-300">
                      <p className="text-yellow-800 text-lg font-bold">⚠️ No data entered yet!</p>
                      <p className="text-yellow-700 text-sm mt-2">Enter spend and/or leads for at least one channel above.</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* WHERE TO FIND YOUR NUMBERS */}
            <div className="bg-blue-50 p-5 rounded-xl mb-4 mt-6 border-2 border-blue-400">
              <h3 className="text-blue-900 font-bold text-lg mb-3">📍 Where to Find Your Numbers</h3>
              <p className="text-blue-800 text-sm mb-3">Not sure where to pull your spend and lead counts? Here's where to look:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="bg-white p-2 rounded">
                  <p className="text-slate-700"><strong>📍 GBP Leads:</strong> Google Business Profile → Performance → Calls + Messages</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-slate-700"><strong>📘 Facebook Leads:</strong> Meta Business Suite → Insights → Actions on Page</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-slate-700"><strong>🔍 Google Ads:</strong> Google Ads Dashboard → Campaigns → Conversions</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-slate-700"><strong>🏘️ Nextdoor:</strong> Business Page → Analytics → Inquiries</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-slate-700"><strong>⭐ Yelp:</strong> Yelp for Business → Analytics → User Actions</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-slate-700"><strong>🤝 Referrals / 🥷 Guerrilla:</strong> Your CRM or manual tracking (Jobber, Housecall Pro)</p>
                </div>
              </div>
            </div>

            {/* Essential Links */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">🔗 Essential ROI Tracking Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">📊 <strong>Google Looker Studio:</strong> <a href="https://lookerstudio.google.com" target="_blank" className="text-blue-600 underline font-bold">lookerstudio.google.com</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">📞 <strong>CallRail:</strong> <a href="https://callrail.com" target="_blank" className="text-blue-600 underline font-bold">callrail.com</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">📞 <strong>WhatConverts:</strong> <a href="https://whatconverts.com" target="_blank" className="text-blue-600 underline font-bold">whatconverts.com</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">📍 <strong>GBP Performance:</strong> <a href="https://business.google.com" target="_blank" className="text-blue-600 underline font-bold">business.google.com</a></p>
                </div>
              </div>
            </div>

            {/* Saturday 60 Bridge */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl mb-4 border-2 border-indigo-500">
              <h3 className="text-indigo-900 font-bold text-xl mb-3">📅 RUN THIS EVERY MONTH</h3>
              <p className="text-indigo-800 leading-relaxed">
                Your <strong>📋 30-DAY DOMINATION ROADMAP</strong> schedules this ROI Calculator as part of your monthly <strong>Saturday 60</strong> review. Run it on the 1st of every month — then use the results to adjust your <strong>📊 Analytics Dashboard</strong> focus for the next 30 days. Data drives the budget.
              </p>
            </div>

            {/* Bottom Close Button */}
            <div className="text-center mt-6">
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 text-lg">
                ✕ Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ANALYTICS DASHBOARD GUIDE MODAL */}
      {activeModal === 'analytics' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-5xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">📊 ANALYTICS DASHBOARD GUIDE</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* INTRO */}
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-6 rounded-xl mb-6 border-2 border-orange-500">
              <h3 className="text-orange-900 font-bold text-xl mb-3">📊 Stop Guessing. Start Scaling with Data-Backed Decisions.</h3>
              <div className="text-orange-900 leading-relaxed space-y-2">
                <p><strong>"Likes" don't pay the mortgage—Action Velocity does.</strong></p>
                <p>This guide teaches you how to ignore the noise and find the <strong>"Profit Signals"</strong> in your data. Learn which zip codes are actually calling you and which "Hacks" are beating the franchises.</p>
                <p className="mt-3 font-semibold">🎯 The 80/20 Rule: 20% of your content drives 80% of your results. Analytics shows you which 20%!</p>
              </div>
            </div>

            {/* TIME COMMITMENT */}
            <div className="bg-blue-50 p-5 rounded-xl mb-6 border-2 border-blue-400">
              <h3 className="text-blue-900 font-bold text-lg mb-3">⏱️ Time Commitment</h3>
              <div className="space-y-2 text-blue-900">
                <div><strong>📅 Weekly Check-In:</strong> 10 minutes - Quick scan of key metrics</div>
                <div><strong>📊 Monthly Deep-Dive:</strong> 30 minutes - Analyze trends, optimize strategy</div>
                <div><strong>🎯 What to Look For:</strong> Spikes in calls/messages, best-performing posts, platform trends</div>
              </div>
            </div>

            {/* THE BIG 5 METRICS */}
            <div className="bg-green-50 p-6 rounded-xl mb-6 border-2 border-green-500">
              <h3 className="text-green-900 font-bold text-xl mb-4">🎯 The "Big 5" Metrics That Actually Matter</h3>
              <div className="space-y-3 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-600">
                  <strong className="text-green-700 text-lg">1. 📞 Phone Calls</strong>
                  <p className="text-sm mt-1">Highest intent action for emergency calls (plumbing, HVAC, electrical, restoration). Someone calling = warm lead ready to book.</p>
                  <div className="bg-amber-50 p-3 rounded mt-2 border-l-4 border-amber-500">
                    <p className="text-amber-800 text-sm font-bold">📞 The "Quality" Signal:</p>
                    <p className="text-amber-700 text-xs mt-1">Google now monitors <strong>call length.</strong> If you have 50 calls but they all last 10 seconds, your ranking will drop. <strong>The Fix:</strong> Ensure whoever answers the phone uses a "Discovery Script" to keep the lead on the line for at least <strong>60 seconds.</strong></p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-600">
                  <strong className="text-green-700 text-lg">2. 📋 Lead Form Submissions</strong>
                  <p className="text-sm mt-1">Highest intent for <strong>Roofing/HVAC installs</strong> and planned projects. Track form-to-booking conversion rate.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-600">
                  <strong className="text-green-700 text-lg">3. 🗺️ Direction Requests</strong>
                  <p className="text-sm mt-1">Proof your <strong>Hyper-Local SEO</strong> is working. They're coming to your shop/office = serious intent.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-600">
                  <strong className="text-green-700 text-lg">4. ⚡ Action Velocity</strong>
                  <p className="text-sm mt-1">How fast a user goes from seeing a <strong>[Landmark Hack]</strong> post to clicking "Call." Faster velocity = better content hooks.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-600">
                  <strong className="text-green-700 text-lg">5. 📅 Appointment Bookings</strong>
                  <p className="text-sm mt-1">Integration with tools like <strong>Housecall Pro</strong> or <strong>Jobber.</strong> The ultimate proof that marketing → revenue.</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <strong className="text-red-700">❌ IGNORE These Vanity Metrics:</strong>
                <ul className="text-sm mt-2 space-y-1 text-slate-700">
                  <li>• Follower count (doesn't equal customers)</li>
                  <li>• Likes alone (low intent, easy to give)</li>
                  <li>• Impressions without engagement (just eyeballs, no action)</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Check your <strong>Google Business Performance Dashboard</strong> or your CRM (<strong>Jobber/Housecall Pro</strong>). Use the "Big 5" metrics found there to see if the <strong>[📍 Hyper-Local SEO]</strong> and <strong>[🛡️ Authority Builder]</strong> strategies you just deployed are causing spikes in calls.</p>
              </div>
            </div>

            {/* PLATFORM SECTIONS */}
            <div className="space-y-4">

              {/* GOOGLE BUSINESS PROFILE */}
              <details className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border-2 border-red-500">
                <summary className="font-bold text-xl text-red-900 cursor-pointer">
                  📍 Google Business Profile Insights (MOST IMPORTANT!)
                </summary>

                <div className="mt-4 space-y-4 text-slate-800">
                  <div className="bg-white p-4 rounded-lg">
                    <strong className="text-red-700">📍 Where to Find It:</strong>
                    <p className="text-sm mt-2">1. Go to <a href="https://business.google.com" target="_blank" className="text-blue-600 underline">business.google.com</a></p>
                    <p className="text-sm">2. Click "Performance" in left sidebar</p>
                    <p className="text-sm">3. View dashboard with all key metrics</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <strong className="text-red-700">🎯 Key Metrics to Track:</strong>
                    <div className="mt-3 space-y-3 text-sm">
                      <div>
                        <strong>Total Searches (How People Found You)</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• <strong>Direct Searches:</strong> Searched your business name (brand awareness working!)</li>
                          <li>• <strong>Discovery Searches:</strong> Found you via category/service (SEO working!)</li>
                          <li>• <strong>Goal:</strong> Increase discovery searches (more new customers)</li>
                        </ul>
                      </div>

                      <div>
                        <strong>Actions Customers Took</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• <strong>📞 Phone Calls:</strong> Track weekly trends. Spikes = something worked!</li>
                          <li>• <strong>🗺️ Direction Requests:</strong> People coming to you = serious intent</li>
                          <li>• <strong>🌐 Website Clicks:</strong> Which posts drive website traffic?</li>
                          <li>• <strong>💬 Messages:</strong> Respond within 15 min for "Very Responsive" badge</li>
                        </ul>
                      </div>

                      <div>
                        <strong>Profile Views & Photo Views</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Track if your optimization efforts increase views</li>
                          <li>• Photos with more views = engaging content (do more like this)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                    <strong className="text-yellow-700">📊 What to Track Weekly:</strong>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>✓ Call volume trends (up or down?)</li>
                      <li>✓ Search query terms (what people type to find you)</li>
                      <li>✓ Direction requests (intent to visit)</li>
                      <li>✓ Post performance (which posts got engagement)</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-600">
                    <strong className="text-red-700">🚨 Red Flags:</strong>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• Dropping search volume → Need more reviews + fresh content</li>
                      <li>• High views, no calls → Weak call-to-action or bad photos</li>
                      <li>• Only brand searches, no discovery → SEO needs work</li>
                    </ul>
                  </div>
                </div>
              </details>

              {/* FACEBOOK INSIGHTS */}
              <details className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-500">
                <summary className="font-bold text-xl text-blue-900 cursor-pointer">
                  📘 Facebook (Meta) Insights
                </summary>

                <div className="mt-4 space-y-4 text-slate-800">
                  <div className="bg-white p-4 rounded-lg">
                    <strong className="text-blue-700">📍 Where to Find It:</strong>
                    <p className="text-sm mt-2">1. Go to your Facebook Business Page</p>
                    <p className="text-sm">2. Click "Insights" in the left menu</p>
                    <p className="text-sm">3. View Overview, Posts, People tabs</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <strong className="text-blue-700">🎯 Key Metrics to Track:</strong>
                    <div className="mt-3 space-y-3 text-sm">
                      <div>
                        <strong>Reach (How Many People Saw It)</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Total reach per post</li>
                          <li>• Organic vs Paid reach</li>
                          <li>• Goal: Increase organic reach through engagement</li>
                        </ul>
                      </div>

                      <div>
                        <strong>Engagement (What People Did)</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• <strong>Saves:</strong> GOLD! Algorithm loves this. People saving = future intent</li>
                          <li>• <strong>Shares:</strong> Expands reach to new audiences</li>
                          <li>• <strong>Comments:</strong> Boosts visibility. ALWAYS respond!</li>
                          <li>• <strong>Likes:</strong> Nice but low-value (easy to give)</li>
                        </ul>
                      </div>

                      <div>
                        <strong>Page Actions</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Calls, messages, website clicks</li>
                          <li>• Track which posts drive actions (not just likes)</li>
                        </ul>
                      </div>

                      <div>
                        <strong>Post Performance</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Sort by engagement to find winners</li>
                          <li>• What type of content performs best? (tips, before/after, jobs)</li>
                          <li>• Best posting times (when your audience is online)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                    <strong className="text-yellow-700">📊 What to Track Weekly:</strong>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>✓ Top performing posts (do more like these!)</li>
                      <li>✓ Post type performance (video vs photo vs text)</li>
                      <li>✓ Engagement rate trends</li>
                      <li>✓ Best times to post (check "When Your Fans Are Online")</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-600">
                    <strong className="text-red-700">🚨 Red Flags:</strong>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• Declining reach → Need more engagement (ask questions, encourage comments)</li>
                      <li>• Low engagement rate (under 1%) → Content not resonating, try different angles</li>
                      <li>• No saves or shares → Content not valuable enough to keep</li>
                    </ul>
                  </div>
                </div>
              </details>

              {/* NEXTDOOR ANALYTICS */}
              <details className="bg-gradient-to-r from-green-50 to-lime-50 p-6 rounded-xl border-2 border-green-500">
                <summary className="font-bold text-xl text-green-900 cursor-pointer">
                  🏘️ Nextdoor Analytics
                </summary>

                <div className="mt-4 space-y-4 text-slate-800">
                  <div className="bg-white p-4 rounded-lg">
                    <strong className="text-green-700">📍 Where to Find It:</strong>
                    <p className="text-sm mt-2">1. Go to your Nextdoor Business Page</p>
                    <p className="text-sm">2. Click "Analytics" or "Insights"</p>
                    <p className="text-sm">3. View post performance and business reach</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <strong className="text-green-700">🎯 Key Metrics to Track:</strong>
                    <div className="mt-3 space-y-3 text-sm">
                      <div>
                        <strong>Post Reach (Neighborhood Coverage)</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• How many neighbors saw your post</li>
                          <li>• Which neighborhoods engage most</li>
                        </ul>
                      </div>

                      <div>
                        <strong>Recommendations Received</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• <strong>GOLD METRIC!</strong> Nextdoor's version of reviews</li>
                          <li>• Recommendations = hyperlocal social proof</li>
                          <li>• Ask happy customers to recommend you on Nextdoor</li>
                        </ul>
                      </div>

                      <div>
                        <strong>Leads/Inquiries</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Direct messages from neighbors</li>
                          <li>• Track response rate (respond within hours!)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                    <strong className="text-yellow-700">📊 What to Track Weekly:</strong>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>✓ New recommendations received</li>
                      <li>✓ Which neighborhoods engage most (expand service area there)</li>
                      <li>✓ Inquiry conversion rate (messages → booked jobs)</li>
                    </ul>
                  </div>

                  <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-600">
                    <strong className="text-green-700">💡 Pro Tip:</strong>
                    <p className="text-sm mt-1">Nextdoor is all about trust. Recommendations carry HUGE weight. After every job, ask satisfied customers: "Would you mind recommending us on Nextdoor?" One recommendation can lead to 5-10 neighbor jobs!</p>
                  </div>
                </div>
              </details>

              {/* YELP ANALYTICS */}
              <details className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-500">
                <summary className="font-bold text-xl text-yellow-900 cursor-pointer">
                  ⭐ Yelp Business Analytics
                </summary>

                <div className="mt-4 space-y-4 text-slate-800">
                  <div className="bg-white p-4 rounded-lg">
                    <strong className="text-yellow-700">📍 Where to Find It:</strong>
                    <p className="text-sm mt-2">1. Go to <a href="https://business.yelp.com" target="_blank" className="text-blue-600 underline">business.yelp.com</a></p>
                    <p className="text-sm">2. Log into your business account</p>
                    <p className="text-sm">3. Click "Analytics" in the dashboard</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <strong className="text-yellow-700">🎯 Key Metrics to Track:</strong>
                    <div className="mt-3 space-y-3 text-sm">
                      <div>
                        <strong>Page Views</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Total views of your Yelp listing</li>
                          <li>• Mobile vs Desktop views</li>
                          <li>• Track trends over time</li>
                        </ul>
                      </div>

                      <div>
                        <strong>User Actions (THE IMPORTANT STUFF)</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• <strong>📞 Calls:</strong> How many people called from Yelp</li>
                          <li>• <strong>🗺️ Direction Requests:</strong> Intent to visit</li>
                          <li>• <strong>🌐 Website Clicks:</strong> Learning more about you</li>
                          <li>• <strong>💬 Messages:</strong> Direct inquiries</li>
                        </ul>
                      </div>

                      <div>
                        <strong>Search Appearances</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• How often you appear in Yelp searches</li>
                          <li>• Which search terms people use to find you</li>
                        </ul>
                      </div>

                      <div>
                        <strong>Customer Leads</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Track conversion: Views → Actions</li>
                          <li>• Good conversion = 5-10% of views become actions</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                    <strong className="text-yellow-700">📊 What to Track Weekly:</strong>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>✓ How many views convert to phone calls</li>
                      <li>✓ Review response rate (respond to ALL reviews!)</li>
                      <li>✓ Photo views (which photos get clicks)</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-600">
                    <strong className="text-red-700">⚠️ CRITICAL: Don't Pay for Yelp Ads!</strong>
                    <p className="text-sm mt-2">Yelp will aggressively push you to buy ads. DON'T! The free version works great if you:</p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>✓ Keep profile 100% complete</li>
                      <li>✓ Get consistent 5-star reviews</li>
                      <li>✓ Respond to ALL reviews within 24-48 hours</li>
                      <li>✓ Upload fresh photos monthly</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <strong className="text-purple-700">🥷 The "Stealth" Competitive Move:</strong>
                    <p className="text-sm mt-2">Don't pay for ads, but <strong>do track "Competitor Ad Clicks."</strong> Yelp often shows your business listing <em>underneath</em> a competitor's paid ad. If your "Un-copyable" photo looks better than their paid ad, <strong>you win the lead for free.</strong></p>
                    <p className="text-sm mt-1 italic text-purple-600">💡 This is why great photos + reviews beat paid ads every time on Yelp.</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border-l-4 border-slate-600 mt-2">
                    <p className="text-slate-800 text-sm font-bold">🥷 The "Hero Image" War:</p>
                    <p className="text-slate-700 text-xs mt-1">Check the paid ad at the top of your Yelp category. Is their photo a generic stock image? If so, upload a <strong>[Landmark Hack]</strong> photo of your branded truck at a real job site. When users see a real, local truck right below a fake stock-photo ad, they click the real pro <strong>80% of the time.</strong></p>
                  </div>
                </div>
              </details>

              {/* GOOGLE ANALYTICS */}
              <details className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-500">
                <summary className="font-bold text-xl text-purple-900 cursor-pointer">
                  🌐 Google Analytics (Website)
                </summary>

                <div className="mt-4 space-y-4 text-slate-800">
                  <div className="bg-white p-4 rounded-lg">
                    <strong className="text-purple-700">📍 Where to Find It:</strong>
                    <p className="text-sm mt-2">1. Go to <a href="https://analytics.google.com" target="_blank" className="text-blue-600 underline">analytics.google.com</a></p>
                    <p className="text-sm">2. Select your website property</p>
                    <p className="text-sm">3. View Reports dashboard</p>
                    <p className="text-sm mt-2 text-slate-600"><em>Note: Setup instructions in "Website SEO Guide" module</em></p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <strong className="text-purple-700">🎯 Key Metrics for Service Businesses:</strong>
                    <div className="mt-3 space-y-3 text-sm">
                      <div>
                        <strong>Traffic Sources (Where Visitors Come From)</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• <strong>Organic Search:</strong> Found you on Google (SEO working!)</li>
                          <li>• <strong>Direct:</strong> Typed your URL (brand awareness)</li>
                          <li>• <strong>Social:</strong> Came from Facebook/Nextdoor/etc</li>
                          <li>• <strong>Referral:</strong> Clicked from another website</li>
                          <li>• Track which sources drive the most traffic</li>
                        </ul>
                      </div>

                      <div>
                        <strong>Top Pages Visited</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Which service pages get most views</li>
                          <li>• What content people read most</li>
                          <li>• Create more content on popular topics</li>
                        </ul>
                      </div>

                      <div>
                        <strong>Bounce Rate (% Who Leave Immediately)</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Good: Under 50%</li>
                          <li>• Bad: Over 70% (page not relevant or loads too slow)</li>
                          <li>• Fix: Improve page speed, clearer calls-to-action</li>
                        </ul>
                      </div>

                      <div>
                        <strong>Goal Conversions (The Money Metrics)</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Form submissions</li>
                          <li>• Phone number clicks</li>
                          <li>• Contact page visits</li>
                          <li>• Set up goals to track these actions!</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                    <strong className="text-yellow-700">📊 What to Track Weekly:</strong>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>✓ Which marketing channels drive website traffic</li>
                      <li>✓ Most visited service pages (double down on these)</li>
                      <li>✓ Conversion rate (visits → contact forms/calls)</li>
                      <li>✓ Mobile vs Desktop traffic (optimize for your majority)</li>
                    </ul>
                  </div>

                  <div className="bg-purple-100 p-4 rounded-lg border-l-4 border-purple-600">
                    <strong className="text-purple-700">💡 Pro Tip:</strong>
                    <p className="text-sm mt-1">Set up "Events" to track phone number clicks and form submissions as conversions. This shows you which traffic sources actually lead to customer contact!</p>
                  </div>
                </div>
              </details>

              {/* GOOGLE SEARCH CONSOLE */}
              <details className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border-2 border-indigo-500">
                <summary className="font-bold text-xl text-indigo-900 cursor-pointer">
                  🔍 Google Search Console
                </summary>

                <div className="mt-4 space-y-4 text-slate-800">
                  <div className="bg-white p-4 rounded-lg">
                    <strong className="text-indigo-700">📍 Where to Find It:</strong>
                    <p className="text-sm mt-2">1. Go to <a href="https://search.google.com/search-console" target="_blank" className="text-blue-600 underline">search.google.com/search-console</a></p>
                    <p className="text-sm">2. Select your website property</p>
                    <p className="text-sm">3. View Performance report</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <strong className="text-indigo-700">🎯 Key Metrics to Track:</strong>
                    <div className="mt-3 space-y-3 text-sm">
                      <div>
                        <strong>Search Queries (What People Type to Find You)</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• See exactly what people searched</li>
                          <li>• Are you ranking for your service keywords?</li>
                          <li>• Example: "HVAC repair Philadelphia" vs "John's HVAC"</li>
                          <li>• Create content around high-search terms you're NOT ranking for</li>
                        </ul>
                      </div>

                      <div>
                        <strong>Impressions vs Clicks</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• <strong>Impressions:</strong> How often you appear in search results</li>
                          <li>• <strong>Clicks:</strong> How often people click your link</li>
                          <li>• <strong>Click-Through Rate (CTR):</strong> Clicks ÷ Impressions</li>
                          <li>• Good CTR = 3-5% for service businesses</li>
                        </ul>
                      </div>

                      <div>
                        <strong>Average Position</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Where you rank in Google search</li>
                          <li>• Goal: Position 1-3 (first page, top results)</li>
                          <li>• Track improvements over time</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                    <strong className="text-yellow-700">📊 What to Track Monthly:</strong>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>✓ Ranking improvements for key service terms</li>
                      <li>✓ Which pages rank best (create similar content)</li>
                      <li>✓ New "near me" search queries appearing</li>
                      <li>✓ Click-through rate trends</li>
                    </ul>
                  </div>

                  <div className="bg-indigo-100 p-4 rounded-lg border-l-4 border-indigo-600">
                    <strong className="text-indigo-700">💡 Pro Tip:</strong>
                    <p className="text-sm mt-1">Filter by "Query" and look for searches containing "near me", "in [your city]", or "best [service]". These are HIGH-INTENT searches. If you're not ranking for these, create dedicated pages!</p>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border-2 border-cyan-500 mt-4">
                    <strong className="text-cyan-800 text-lg">🆕 New Metric: AI Citations (SGE)</strong>
                    <p className="text-sm mt-2 text-slate-700">Google Search Console now looks different. You need to track if you are being <strong>"cited" by AI.</strong></p>
                    <div className="bg-white p-3 rounded mt-3 border-l-4 border-cyan-500">
                      <p className="text-sm text-slate-700"><strong>What to Look For:</strong> Check your <strong>"Top Referenced Pages."</strong> If Google's AI is using your [Authority Builder] blog post to answer a user's question, your "Impressions" will skyrocket even without traditional clicks.</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded mt-2 border-l-4 border-green-500">
                      <p className="text-sm text-green-800"><strong>🏆 The Move:</strong> If a page is getting AI citations, add a <strong>"Book Now" button</strong> to the top of that page immediately. You are the AI's recommended source—capitalize on it!</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded mt-2 border-l-4 border-indigo-500">
                      <p className="text-indigo-800 text-sm font-bold">🤖 The "Featured" Hack:</p>
                      <p className="text-indigo-700 text-xs mt-1">In Search Console, look for keywords where you are in <strong>Position 4–7.</strong> These are your "Low-Hanging Fruit." Use the <strong>❓ FAQ Generator</strong> to create 3 specific Q&As for those keywords. Google's AI often pulls from Position 5 to create an AI Overview answer — <strong>jumping you over the top 3 links!</strong></p>
                    </div>
                  </div>
                </div>
              </details>

            </div>

            {/* ACTION PLAN */}
            <div className="mt-6 bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl border-2 border-green-500">
              <h3 className="text-green-900 font-bold text-xl mb-4">✅ Your Analytics Action Plan</h3>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <strong className="text-green-700 block mb-2">📅 WEEKLY (10 minutes):</strong>
                  <ul className="space-y-1 ml-4 text-sm">
                    <li>✓ Check GBP: Call volume, direction requests, top posts</li>
                    <li>✓ Check Facebook: Top performing posts, engagement rate</li>
                    <li>✓ Check Nextdoor: New recommendations, inquiries</li>
                    <li>✓ Quick scan: Any spikes or drops?</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <strong className="text-green-700 block mb-2">📊 MONTHLY (30 minutes):</strong>
                  <ul className="space-y-1 ml-4 text-sm">
                    <li>✓ Deep-dive all platforms: What worked? What didn't?</li>
                    <li>✓ Compare month-over-month: Growing or declining?</li>
                    <li>✓ Identify best content types: Do MORE of what works</li>
                    <li>✓ Google Analytics: Which marketing drives website traffic?</li>
                    <li>✓ Google Search Console: Ranking improvements?</li>
                    <li>✓ Adjust strategy based on data</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <strong className="text-green-700 block mb-2">🎯 OPTIMIZE Based on Data:</strong>
                  <ul className="space-y-1 ml-4 text-sm">
                    <li>✓ <strong>Post Type:</strong> If before/after photos get 3x more engagement, post more of them!</li>
                    <li>✓ <strong>Timing:</strong> If Tuesday 6pm posts outperform Monday 9am, adjust schedule</li>
                    <li>✓ <strong>Platform:</strong> If GBP drives 70% of calls, prioritize it over Facebook</li>
                    <li>✓ <strong>Content Topic:</strong> If maintenance tips get saved more, create more tips</li>
                    <li>✓ <strong>Stop Waste:</strong> If certain content never performs, stop creating it</li>
                  </ul>
                </div>
              </div>

              <p className="mt-4 text-green-900 font-semibold">
                💰 Bottom Line: Analytics turns guessing into knowing. Track. Analyze. Optimize. Repeat!
              </p>
            </div>

            {/* NEIGHBORHOOD PROFIT TRACKING - HEAT MAP */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl mb-6 border-2 border-orange-500">
              <h3 className="text-orange-900 font-bold text-xl mb-4">📍 Neighborhood Profit Tracking (The "Heat Map" Logic)</h3>
              <div className="space-y-4 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                  <p className="font-bold text-orange-800">🎯 The Hack:</p>
                  <p className="text-sm mt-1">Cross-reference your Google Business Profile <strong>"Direction Requests"</strong> with your actual sales by zip code.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                    <p className="text-red-800 text-sm font-bold">🚨 Getting calls but NO sales from a zip code?</p>
                    <p className="text-red-700 text-xs mt-1">Your <strong>price is too high</strong> for that area. Adjust your offer or focus elsewhere.</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="text-blue-800 text-sm font-bold">🎯 Getting NO calls from a wealthy zip code?</p>
                    <p className="text-blue-700 text-xs mt-1">You need more <strong>[🏘️ Neighborhood Sniper]</strong> posts targeting that area.</p>
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500 mt-3">
                  <p className="text-orange-800 text-sm font-bold">⏱️ The "Lead Ghosting" Audit:</p>
                  <p className="text-orange-700 text-xs mt-1">Cross-reference your <strong>Message volume</strong> with your <strong>Booking volume.</strong> If you're getting 10 messages but only 1 booking, your response time is likely too slow. If you don't respond in <strong>5 minutes</strong>, the lead is <strong>400% less likely to convert.</strong></p>
                </div>
              </div>
            </div>

            {/* RED FLAG TRADE SWEEP */}
            <div className="bg-gradient-to-r from-red-100 to-pink-100 p-6 rounded-xl mb-6 border-2 border-red-500">
              <h3 className="text-red-900 font-bold text-xl mb-4">🚩 The "Red Flag" Trade Sweep</h3>
              <div className="space-y-3 text-slate-800">
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800 text-sm">🌡️⚡ HVAC / Electrician Red Flag: "High Impressions, Low Clicks" on Safety Inspection posts?</p>
                  <p className="text-slate-700 text-xs mt-1"><strong>The Fix:</strong> Your hook is too boring. Use the <strong>🎬 Video Script Command Center</strong> to create a "Scare-to-Repair" hook that creates urgency.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                  <p className="font-bold text-orange-800 text-sm">🏠 Roofing Red Flag: "Saves/Shares" are high but Calls are low?</p>
                  <p className="text-slate-700 text-xs mt-1"><strong>The Fix:</strong> You are providing too much "DIY" info and not enough "Hire Me" urgency. Switch to a <strong>⚡ Weather Alert</strong> style post.</p>
                </div>
              </div>
            </div>

            {/* ROI TOOL SYNC */}
            <div className="bg-blue-50 p-4 rounded-xl mb-6 border-l-4 border-blue-500">
              <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Use the <strong>🎯 ROI Calculator</strong> tool to input your "Cost Per Lead" from these analytics. If your GBP calls cost <strong>$0</strong> and your Facebook leads cost <strong>$20</strong>, the data is telling you to post more on GBP!</p>
            </div>

            {/* ESSENTIAL ANALYTICS LINKS */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 rounded-xl mb-6 border-2 border-slate-500">
              <h3 className="text-white font-bold text-xl mb-3">🔗 Essential Analytics Links & Tools</h3>
              <div className="space-y-2">
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-sm text-slate-200"><strong className="text-yellow-400">📊 Google Looker Studio (Free):</strong> <a href="https://lookerstudio.google.com" target="_blank" className="text-blue-400 underline font-bold">lookerstudio.google.com</a> (See Facebook, Google, and Website data in one single page)</p>
                </div>
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-sm text-slate-200"><strong className="text-yellow-400">📞 CallRail:</strong> <a href="https://callrail.com" target="_blank" className="text-blue-400 underline">callrail.com</a> (Tells you exactly which Facebook post or Google search triggered the phone call)</p>
                </div>
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-sm text-slate-200"><strong className="text-yellow-400">📞 WhatConverts:</strong> <a href="https://whatconverts.com" target="_blank" className="text-blue-400 underline">whatconverts.com</a> (Essential call tracking—connects marketing spend to actual revenue)</p>
                </div>
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-sm text-slate-200"><strong className="text-yellow-400">🔥 Hotjar (Free version):</strong> <a href="https://hotjar.com" target="_blank" className="text-blue-400 underline">hotjar.com</a> (See a "Heat Map" of where people click on your website)</p>
                </div>
              </div>
            </div>

            {/* 5-MINUTE MONTHLY DATA AUDIT WORKSHEET */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl mb-6 border-4 border-indigo-500">
              <h3 className="text-indigo-900 font-bold text-2xl mb-2">📝 The "5-Minute Monthly Data Audit" Worksheet</h3>
              <p className="text-indigo-700 text-sm mb-4">🎯 <strong>The Goal:</strong> Stop reporting and start optimizing. Answer these 5 questions on the 1st of every month to pivot your strategy for higher ROI.</p>

              <div className="space-y-4">
                {/* Question 1 */}
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-start gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                    <div>
                      <p className="font-bold text-indigo-800">The "Action Velocity" Check</p>
                      <p className="text-slate-700 text-sm mt-1"><strong>❓ Question:</strong> Which single post or platform drove the most direct actions (Calls/Messages) this month?</p>
                      <div className="bg-green-50 p-2 rounded mt-2 border-l-4 border-green-400">
                        <p className="text-green-800 text-xs"><strong>✅ Action:</strong> Take that specific topic (e.g., "How to spot a roof leak") and create <strong>3 new versions</strong> of it for next month. Double down on what works.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question 2 */}
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                    <div>
                      <p className="font-bold text-indigo-800">The "SEO Visibility" Check</p>
                      <p className="text-slate-700 text-sm mt-1"><strong>❓ Question:</strong> Are we ranking for "Near Me" or "Emergency" keywords in our target wealthy zip codes?</p>
                      <div className="bg-blue-50 p-2 rounded mt-2 border-l-4 border-blue-400">
                        <p className="text-blue-800 text-xs"><strong>✅ Action:</strong> If no, deploy a <strong>[Landmark Hack]</strong> post specifically tagged in those neighborhoods this week.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question 3 */}
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-start gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                    <div>
                      <p className="font-bold text-indigo-800">The "Vanity vs. Value" Filter</p>
                      <p className="text-slate-700 text-sm mt-1"><strong>❓ Question:</strong> Did our highest-reaching post actually lead to a booking?</p>
                      <div className="bg-yellow-50 p-2 rounded mt-2 border-l-4 border-yellow-400">
                        <p className="text-yellow-800 text-xs"><strong>✅ Action:</strong> If you had 5,000 views but 0 calls, your Hook was good but your <strong>Call-to-Action (CTA) was weak.</strong> Add a "Neighborhood Discount" button to your next post.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question 4 */}
                <div className="bg-white p-4 rounded-lg border-l-4 border-cyan-500">
                  <div className="flex items-start gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                    <div>
                      <p className="font-bold text-indigo-800">The "AI Citation" Audit</p>
                      <p className="text-slate-700 text-sm mt-1"><strong>❓ Question:</strong> Is Google's AI (SGE) using our website to answer customer questions? (Check Search Console for "AI Overviews").</p>
                      <div className="bg-cyan-50 p-2 rounded mt-2 border-l-4 border-cyan-400">
                        <p className="text-cyan-800 text-xs"><strong>✅ If YES:</strong> Update that page with a <strong>[Scientific Diagnostic Map]</strong> to solidify your authority.</p>
                        <p className="text-cyan-800 text-xs mt-1"><strong>✅ If NO:</strong> Use the <strong>[Authority Builder]</strong> to write one "Technical FAQ" post this week.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question 5 */}
                <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-start gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                    <div>
                      <p className="font-bold text-indigo-800">The "Profit Heat Map" Decision</p>
                      <p className="text-slate-700 text-sm mt-1"><strong>❓ Question:</strong> Where did our most profitable job come from this month?</p>
                      <div className="bg-orange-50 p-2 rounded mt-2 border-l-4 border-orange-400">
                        <p className="text-orange-800 text-xs"><strong>✅ Action:</strong> Stop "hunting" in low-margin areas. Move your <strong>[🏘️ Neighborhood Sniper]</strong> focus to a <strong>5-mile radius</strong> around that high-profit job site.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Tool Syncs */}
              <div className="mt-4 space-y-2">
                <div className="bg-blue-500/10 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Use <strong>Google Looker Studio</strong> (free) to build a single-page dashboard that syncs your GBP, Google Analytics, and Search Console data. Pair it with CallRail or WhatConverts to see "Lead-to-Job" conversion rates automatically.</p>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="text-blue-800 text-sm"><strong>🔧 TOOL SYNC:</strong> <strong>[🎯 ROI Calculator]</strong> — Input your monthly ad spend vs. your "Discovery Search" calls. If your organic calls are $0/lead, increase your posting frequency to 3x a week.</p>
                </div>
              </div>
            </div>

            {/* Saturday 60 Bridge */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl mb-4 border-2 border-indigo-500">
              <h3 className="text-indigo-900 font-bold text-xl mb-3">📅 DATA DRIVES THE ROADMAP</h3>
              <p className="text-indigo-800 leading-relaxed">
                Your <strong>📋 30-DAY DOMINATION ROADMAP</strong> includes a weekly 10-minute analytics check-in every Friday. The <strong>Saturday 60</strong> monthly review is when you run the full "5-Minute Monthly Data Audit" worksheet above — pivot your strategy based on what the numbers tell you, not what you "feel."
              </p>
            </div>

            {/* Analytics Bottom Close Button */}
            <div className="text-center mt-6">
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 text-lg">
                ✕ Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ═══════════════ UNFAIR ADVANTAGE GUIDE MODAL ═══════════════ */}
      {activeModal === 'unfairAdvantage' && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/95 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => openModal(null)}>
          <div className="modal-content bg-white text-slate-900 rounded-2xl p-8 max-w-5xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-3xl font-bold">🚀 THE UNFAIR ADVANTAGE GUIDE</h2>
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700">✕ Close</button>
            </div>

            {/* INTRO */}
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-xl mb-6 border-2 border-purple-500">
              <h3 className="text-purple-900 font-bold text-xl mb-3">The "First-to-Market" Playbook for Zero-Competition Leads</h3>
              <div className="text-purple-900 leading-relaxed space-y-2">
                <p>Today, the biggest mistake is following the crowd. While other companies <strong>"rent"</strong> their leads from expensive middle-men, you are going to <strong>own the "Silent Market."</strong></p>
                <p>Below are the <strong>10 digital platforms</strong> you need to claim now. Most of these are <strong>100% free.</strong></p>
                <p className="font-bold mt-3">⚡ Your competitors don't even know these exist. That's your advantage.</p>
              </div>
            </div>

            {/* PLATFORM 1: Apple Business Connect */}
            <details className="bg-gradient-to-r from-slate-50 to-gray-50 p-5 rounded-xl mb-4 border-2 border-slate-400">
              <summary className="font-bold text-lg text-slate-900 cursor-pointer hover:text-slate-700">
                🍎 1. Apple Business Connect — The Siri/CarPlay Monopoly <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">FREE</span> <span className="text-sm font-normal italic ml-2">(Click to expand)</span>
              </summary>
              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-slate-500">
                  <p className="font-bold text-slate-800">What it is:</p>
                  <p className="text-sm">Apple's answer to the Google Business Profile. It controls how your business appears in <strong>Apple Maps, Siri, and CarPlay.</strong></p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800">🎯 The Advantage:</p>
                  <p className="text-sm text-green-700">Most tradesmen only focus on Google. By claiming this, you become the <strong>#1 choice for the 50% of the market that uses iPhones and CarPlay.</strong></p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800">💡 The Hack:</p>
                  <p className="text-sm text-yellow-700">Use <strong>"Showcases"</strong> to post weekly photos. Siri uses these to decide who to recommend when a driver asks, <em>"Siri, find a [Trade] near me."</em></p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800">📋 Instructions:</p>
                  <p className="text-sm text-blue-700">Go to <a href="https://businessconnect.apple.com" target="_blank" className="text-blue-600 underline font-bold">Apple Business Connect</a>. Sign in with an Apple ID, verify your business location via phone/text, and immediately upload 3 "Landmark" photos of your truck.</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                  <p className="text-purple-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Use your <strong>📍 Hyper-Local SEO → Landmark Cheat Sheet</strong> photos here too! Same geotagged landmark photos that boost Google also boost Siri rankings.</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border-l-4 border-slate-600">
                  <p className="font-bold text-slate-800 text-sm">🍎 The "Instant Action" Factor:</p>
                  <p className="text-sm text-slate-700 mt-1">In your Apple Business Connect dashboard, enable the <strong>"Contact"</strong> and <strong>"Get Quote"</strong> action buttons. Siri doesn't just show your name — she can initiate a text message to you directly from the lock screen. This <strong>"Zero-Click" conversion</strong> is the fastest lead in the industry.</p>
                </div>
              </div>
            </details>

            {/* PLATFORM 2: Answer Engine Optimization */}
            <details className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-xl mb-4 border-2 border-blue-400">
              <summary className="font-bold text-lg text-blue-900 cursor-pointer hover:text-blue-700">
                🤖 2. Answer Engine Optimization — The "AI Citation" Play <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">FREE</span> <span className="text-sm font-normal italic ml-2">(Click to expand)</span>
              </summary>
              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800">What it is:</p>
                  <p className="text-sm">Optimizing your business so <strong>ChatGPT, Gemini, and Perplexity</strong> recommend you as the local expert.</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800">🎯 The Advantage:</p>
                  <p className="text-sm text-green-700">AI assistants don't give a list of 10 links; they give <strong>one name.</strong> You want that name to be yours.</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800">💡 The Hack:</p>
                  <p className="text-sm text-yellow-700">AI models pull their local data from <strong>Bing Places.</strong> Keep your data <strong>100% identical</strong> on Bing and Google to earn the "Trust Signal" AI needs.</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800">📋 Instructions:</p>
                  <p className="text-sm text-blue-700">Go to <a href="https://www.bingplaces.com" target="_blank" className="text-blue-600 underline font-bold">Bing Places for Business</a>. Use the <strong>"Import from Google Business Profile"</strong> tool to sync your data in 30 seconds.</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                  <p className="text-purple-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Your <strong>❓ FAQ/Website Content Generator</strong> creates FAQ Schema markup that AI models use to decide authority. More FAQ pages = more AI citations.</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500">
                  <p className="font-bold text-indigo-800 text-sm">🤖 The "Sentiment" Signal:</p>
                  <p className="text-sm text-indigo-700 mt-1">ChatGPT prioritizes businesses with <strong>"Highly Descriptive" reviews.</strong> When using the <strong>⭐ Review Maximizer</strong>, ensure your replies mention the specific technology used (e.g., <em>"Glad we could use the FLIR thermal camera to find that leak!"</em>). This technical vocabulary tells the AI you are a <strong>specialist</strong>, not a generalist.</p>
                </div>
              </div>
            </details>

            {/* PLATFORM 3: WhatsApp Business */}
            <details className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl mb-4 border-2 border-green-400">
              <summary className="font-bold text-lg text-green-900 cursor-pointer hover:text-green-700">
                💬 3. WhatsApp Business Channels — The "Private Loop" Monopoly <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">FREE</span> <span className="text-sm font-normal italic ml-2">(Click to expand)</span>
              </summary>
              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800">What it is:</p>
                  <p className="text-sm">A one-way broadcast tool that lets you send alerts directly to a customer's phone without the "noise" of a group chat.</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-600">
                  <p className="font-bold text-green-800">🎯 The Advantage:</p>
                  <p className="text-sm text-green-700"><strong>98% open rates.</strong> Emails get ignored; WhatsApp messages get read instantly.</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800">💡 The Hack:</p>
                  <p className="text-sm text-yellow-700">Send a <strong>"Storm Warning"</strong> or <strong>"Maintenance Tip"</strong> once a month. When customers forward your helpful tip to their neighborhood group, it's a <strong>verified referral.</strong></p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800">📋 Instructions:</p>
                  <p className="text-sm text-blue-700">Download the <strong>WhatsApp Business App</strong> (iOS/Android). Go to Updates → Channels → Create Channel. Add your link to every invoice and email signature.</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                  <p className="text-purple-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Use your <strong>⚡ Weather Alert Urgency Posts</strong> tool to generate the monthly "Storm Warning" tip for your WhatsApp broadcast.</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-600">
                  <p className="font-bold text-green-800 text-sm">💬 The "Viral Loop":</p>
                  <p className="text-sm text-green-700 mt-1">At the end of your monthly WhatsApp tip, write: <strong>"Know a neighbor who needs this? Forward this tip to your neighborhood group!"</strong> Because it's coming from a "Channel," it includes your business profile link automatically when shared — turning every tip into a verified referral.</p>
                </div>
              </div>
            </details>

            {/* PLATFORM 4: Home Depot Pro Referral */}
            <details className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-xl mb-4 border-2 border-orange-400">
              <summary className="font-bold text-lg text-orange-900 cursor-pointer hover:text-orange-700">
                🔨 4. Home Depot "Pro Referral" — The $0 Lead Loop <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">FREE</span> <span className="text-sm font-normal italic ml-2">(Click to expand)</span>
              </summary>
              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-orange-500">
                  <p className="font-bold text-orange-800">What it is:</p>
                  <p className="text-sm">A lead-sharing platform powered by your material purchases at Home Depot.</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800">🎯 The Advantage:</p>
                  <p className="text-sm text-green-700">Instead of paying $100 for a lead, you <strong>"earn" them using points</strong> from materials you were already going to buy.</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800">💡 The Hack:</p>
                  <p className="text-sm text-yellow-700">Use your <strong>📸 Before/After</strong> content in your Pro gallery. Most pros here have <strong>empty profiles</strong> — a full gallery wins the job every time.</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800">📋 Instructions:</p>
                  <p className="text-sm text-blue-700">Go to <a href="https://www.homedepot.com/c/Pro_Referral" target="_blank" className="text-blue-600 underline font-bold">Home Depot Pro Referral</a>. Sign up for a Pro Xtra account. Download the Pro Referral app and link your material spend to start earning "Lead Points."</p>
                </div>
              </div>
            </details>

            {/* PLATFORM 5: TaskRabbit */}
            <details className="bg-gradient-to-r from-teal-50 to-cyan-50 p-5 rounded-xl mb-4 border-2 border-teal-400">
              <summary className="font-bold text-lg text-teal-900 cursor-pointer hover:text-teal-700">
                🐇 5. TaskRabbit "Tasks" — The "Foot-in-the-Door" Sniper <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">$25 ONE-TIME</span> <span className="text-sm font-normal italic ml-2">(Click to expand)</span>
              </summary>
              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-teal-500">
                  <p className="font-bold text-teal-800">What it is:</p>
                  <p className="text-sm">A platform for "Quick Fix" bookings — mounting, repairs, small installs.</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800">🎯 The Advantage:</p>
                  <p className="text-sm text-green-700">It bypasses the 3-day quoting process. You get booked, you show up, you get paid.</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800">💡 The Hack:</p>
                  <p className="text-sm text-yellow-700">Use small <strong>$150 tasks</strong> to get into high-value homes, then offer a <strong>"30-Point System Inspection"</strong> to find larger, high-margin projects.</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800">📋 Instructions:</p>
                  <p className="text-sm text-blue-700">Go to <a href="https://www.taskrabbit.com/become-a-tasker" target="_blank" className="text-blue-600 underline font-bold">TaskRabbit for Pros</a>. Create a profile, set your hourly rate, and toggle <strong>"Same-Day Tasks"</strong> to fill gaps in your crew's schedule.</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                  <p className="text-purple-800 text-sm"><strong>🔧 TOOL SYNC:</strong> After every TaskRabbit job, run the <strong>🔄 Job Pipeline</strong> to convert that small job into review + referral + content. A $150 task can generate a $5,000 upsell.</p>
                </div>
                <div className="bg-teal-50 p-3 rounded-lg border-l-4 border-teal-500">
                  <p className="font-bold text-teal-800 text-sm">⏳ TaskRabbit Algorithm Hack:</p>
                  <p className="text-sm text-teal-700 mt-1">TaskRabbit's algorithm is <strong>100% based on Response Speed.</strong> Set your "Auto-Reply" in the Tasker app to trigger within <strong>2 minutes</strong> to stay at the top of the "Available Now" list.</p>
                </div>
              </div>
            </details>

            {/* PLATFORM 6: Nextdoor Faves Ads */}
            <details className="bg-gradient-to-r from-lime-50 to-green-50 p-5 rounded-xl mb-4 border-2 border-lime-400">
              <summary className="font-bold text-lg text-lime-900 cursor-pointer hover:text-lime-700">
                🏘️ 6. Nextdoor "Faves" Ads — The Hyper-Local Sniper <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">~$3-5/DAY</span> <span className="text-sm font-normal italic ml-2">(Click to expand)</span>
              </summary>
              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-lime-500">
                  <p className="font-bold text-lime-800">What it is:</p>
                  <p className="text-sm">Highly targeted ads that only appear to people in <strong>specific wealthy neighborhoods.</strong></p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800">🎯 The Advantage:</p>
                  <p className="text-sm text-green-700">Your ad appears alongside <strong>recommendations from neighbors</strong>, giving you instant "neighborhood trust."</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800">💡 The Hack:</p>
                  <p className="text-sm text-yellow-700">Target only your <strong>Top 10 Zip Codes.</strong> Use a photo of your truck on a street your customers recognize.</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800">📋 Instructions:</p>
                  <p className="text-sm text-blue-700">Go to <a href="https://business.nextdoor.com" target="_blank" className="text-blue-600 underline font-bold">Nextdoor Business Ads</a>. Claim your free business page first. Then select "Create Ad" and choose the <strong>"Neighborhood Faves"</strong> or <strong>"Local Deal"</strong> option.</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                  <p className="text-purple-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Use your <strong>📍 Hyper-Local SEO → Core 10 Zip Code Strategy</strong> to identify which neighborhoods to target. Don't waste money advertising to zip codes that don't convert.</p>
                </div>
              </div>
            </details>

            {/* PLATFORM 7: Amazon Home Services */}
            <details className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl mb-4 border-2 border-amber-400">
              <summary className="font-bold text-lg text-amber-900 cursor-pointer hover:text-amber-700">
                📦 7. Amazon Home Services — The "Ultimate Trust" Badge <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">FREE TO JOIN</span> <span className="text-sm font-normal italic ml-2">(Click to expand)</span>
              </summary>
              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-amber-500">
                  <p className="font-bold text-amber-800">What it is:</p>
                  <p className="text-sm">A service marketplace where Amazon sells your labor alongside the products they ship.</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800">🎯 The Advantage:</p>
                  <p className="text-sm text-green-700">Amazon handles the marketing and the payment. You get <strong>"Amazon-Verified" status</strong> — the ultimate trust signal.</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800">💡 The Hack:</p>
                  <p className="text-sm text-yellow-700">List services for products people buy frequently: <strong>"Smart Thermostat Install"</strong>, <strong>"Faucet Replacement"</strong>, <strong>"Ceiling Fan Install"</strong>.</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800">📋 Instructions:</p>
                  <p className="text-sm text-blue-700">Go to <a href="https://services.amazon.com" target="_blank" className="text-blue-600 underline font-bold">Amazon Home Services</a>. Apply as a pro; you will need your license and insurance. Once approved, "claim" jobs that fit your schedule. Amazon takes 10-20% of the job total.</p>
                </div>
              </div>
            </details>

            {/* PLATFORM 8: AI SMS Auto-Reply */}
            <details className="bg-gradient-to-r from-indigo-50 to-violet-50 p-5 rounded-xl mb-4 border-2 border-indigo-400">
              <summary className="font-bold text-lg text-indigo-900 cursor-pointer hover:text-indigo-700">
                🤖 8. AI SMS Auto-Reply — The "Lead Saver" <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">~$25-40/MO</span> <span className="text-sm font-normal italic ml-2">(Click to expand)</span>
              </summary>
              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-indigo-500">
                  <p className="font-bold text-indigo-800">What it is:</p>
                  <p className="text-sm">An AI tool that instantly texts back any missed calls or website inquiries.</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800">🎯 The Advantage:</p>
                  <p className="text-sm text-green-700">Today, speed is everything. If you don't answer in <strong>60 seconds</strong>, the customer calls someone else.</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800">💡 The Hack:</p>
                  <p className="text-sm text-yellow-700">Program the AI to ask: <strong>"Is this an emergency or a quote request?"</strong> to prioritize high-value jobs.</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800">📋 Instructions:</p>
                  <p className="text-sm text-blue-700">Sign up at <a href="https://smith.ai" target="_blank" className="text-blue-600 underline font-bold">Smith.ai</a> or <a href="https://tidio.com" target="_blank" className="text-blue-600 underline font-bold">Tidio AI</a>. Connect your phone number. Set the auto-reply to trigger after 2 missed rings.</p>
                </div>
              </div>
            </details>

            {/* PLATFORM 9: Geofencing */}
            <details className="bg-gradient-to-r from-rose-50 to-pink-50 p-5 rounded-xl mb-4 border-2 border-rose-400">
              <summary className="font-bold text-lg text-rose-900 cursor-pointer hover:text-rose-700">
                📍 9. Geofencing "Radius Bomb" — The Digital Pin <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">~$5/DAY</span> <span className="text-sm font-normal italic ml-2">(Click to expand)</span>
              </summary>
              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-rose-500">
                  <p className="font-bold text-rose-800">What it is:</p>
                  <p className="text-sm">Digital ads that only show up to people <strong>within 1 mile</strong> of your current job site.</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800">🎯 The Advantage:</p>
                  <p className="text-sm text-green-700">It makes you look like the <strong>"Neighborhood Specialist."</strong></p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800">💡 The Hack:</p>
                  <p className="text-sm text-yellow-700">Use <strong>Facebook Ads (Meta) "Pin Drop"</strong> targeting. Set the radius to 1 mile and say: <em>"We're on [Street Name] today! Since we're here, we're doing $50 off for neighbors."</em></p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800">📋 Instructions:</p>
                  <p className="text-sm text-blue-700">Open Facebook (Meta) Ad Manager, create a "Reach" campaign, and drop a "pin" on your current job location. Set radius to 1 mile.</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                  <p className="text-purple-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Combine this with the <strong>🥷 Guerrilla Marketing → Radius Bomb</strong> door hangers for the ultimate 1-2 punch: digital ads + physical door hangers in the same 1-mile radius.</p>
                </div>
              </div>
            </details>

            {/* PLATFORM 10: AI Review Maximizer */}
            <details className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-xl mb-4 border-2 border-emerald-400">
              <summary className="font-bold text-lg text-emerald-900 cursor-pointer hover:text-emerald-700">
                ⭐ 10. AI Review Maximizer — The "Expert" Signal <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">~$50/MO</span> <span className="text-sm font-normal italic ml-2">(Click to expand)</span>
              </summary>
              <div className="mt-4 space-y-3 text-slate-800">
                <div className="bg-white p-3 rounded-lg border-l-4 border-emerald-500">
                  <p className="font-bold text-emerald-800">What it is:</p>
                  <p className="text-sm">Software that uses AI to text customers for reviews <strong>the second a job is finished.</strong></p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                  <p className="font-bold text-green-800">🎯 The Advantage:</p>
                  <p className="text-sm text-green-700">AI models (ChatGPT) prioritize businesses with the most <strong>"Recent"</strong> reviews.</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-800">💡 The Hack:</p>
                  <p className="text-sm text-yellow-700">Have the AI prompt the customer to mention the <strong>Service and City</strong>: <em>"Best roofer in Skyline View."</em></p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-800">📋 Instructions:</p>
                  <p className="text-sm text-blue-700">Sign up at <a href="https://birdeye.com" target="_blank" className="text-blue-600 underline font-bold">Birdeye</a> or <a href="https://podium.com" target="_blank" className="text-blue-600 underline font-bold">Podium</a>. Connect your CRM so it auto-sends review requests the moment a job is marked "complete."</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                  <p className="text-purple-800 text-sm"><strong>🔧 TOOL SYNC:</strong> Paste each review into the <strong>⭐ Review Maximizer</strong>. It generates a <strong>Keyword-Rich Review Reply</strong> (Asset #4) — a ready-to-paste response stuffed with SEO keywords that reads naturally. Your reply + their review = double the ranking power.</p>
                </div>
              </div>
            </details>

            {/* THE STEALTH MONOPOLY AUDIT */}
            <div className="bg-gradient-to-r from-red-100 to-orange-100 p-6 rounded-xl mb-6 border-2 border-red-500">
              <h3 className="text-red-900 font-bold text-xl mb-3">🔎 THE STEALTH MONOPOLY AUDIT (10 Minutes/Month)</h3>
              <p className="text-red-800 text-sm mb-4">Add this to your <strong>Monthly Saturday 60</strong> — it takes 10 minutes and tells you if the platforms are working:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-red-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-red-800">🍎 Siri Check</p>
                    <p className="text-sm text-slate-700">Ask your phone: <em>"Siri, find a [Your Trade] near me."</em> Are you showing up? If not, your Apple Business Connect needs more Showcases.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-blue-800">🤖 AI Check</p>
                    <p className="text-sm text-slate-700">Ask ChatGPT: <em>"Who is the most trusted [Your Trade] in [Your City]?"</em> If you're not mentioned, your FAQ pages and Bing Places need attention.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-orange-500">
                  <span className="text-2xl">☐</span>
                  <div>
                    <p className="font-bold text-orange-800">🔨 Point Check</p>
                    <p className="text-sm text-slate-700">Log into Home Depot Pro and claim your <strong>"Free" leads.</strong> Check how many points you've accumulated from purchases.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Essential Platform Links */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-4 border-2 border-blue-500">
              <h3 className="text-blue-900 font-bold text-xl mb-3">🔗 Essential Platform Links (Quick Reference)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">🍎 <strong>Apple Business Connect:</strong> <a href="https://businessconnect.apple.com" target="_blank" className="text-blue-600 underline font-bold">businessconnect.apple.com</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">🤖 <strong>Bing Places:</strong> <a href="https://www.bingplaces.com" target="_blank" className="text-blue-600 underline font-bold">bingplaces.com</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">💬 <strong>WhatsApp Business:</strong> <a href="https://business.whatsapp.com" target="_blank" className="text-blue-600 underline font-bold">business.whatsapp.com</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">🔨 <strong>Home Depot Pro Referral:</strong> <a href="https://www.homedepot.com/c/Pro_Referral" target="_blank" className="text-blue-600 underline font-bold">homedepot.com/Pro_Referral</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">🐇 <strong>TaskRabbit for Pros:</strong> <a href="https://www.taskrabbit.com/become-a-tasker" target="_blank" className="text-blue-600 underline font-bold">taskrabbit.com/become-a-tasker</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">🏘️ <strong>Nextdoor Business:</strong> <a href="https://business.nextdoor.com" target="_blank" className="text-blue-600 underline font-bold">business.nextdoor.com</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">📦 <strong>Amazon Home Services:</strong> <a href="https://services.amazon.com" target="_blank" className="text-blue-600 underline font-bold">services.amazon.com</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">🤖 <strong>Smith.ai (AI SMS):</strong> <a href="https://smith.ai" target="_blank" className="text-blue-600 underline font-bold">smith.ai</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">📍 <strong>Facebook (Meta) Ads:</strong> <a href="https://www.facebook.com/business/ads" target="_blank" className="text-blue-600 underline font-bold">facebook.com/business/ads</a></p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm text-slate-700">⭐ <strong>Birdeye (Reviews):</strong> <a href="https://birdeye.com" target="_blank" className="text-blue-600 underline font-bold">birdeye.com</a></p>
                </div>
              </div>
            </div>

            {/* Saturday 60 Bridge */}
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-4">
              <p className="text-blue-800 text-sm">
                Your <strong>📋 30-DAY DOMINATION ROADMAP</strong> includes the Stealth Monopoly Audit in your monthly <strong>"Saturday 60"</strong> review. The weekly Apple Showcase photos and monthly WhatsApp broadcast are also scheduled in the roadmap!
              </p>
            </div>

            {/* Guide Bottom Close Button */}
            <div className="text-center mt-6">
              <button onClick={() => openModal(null)} className="bg-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 text-lg">
                ✕ Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
