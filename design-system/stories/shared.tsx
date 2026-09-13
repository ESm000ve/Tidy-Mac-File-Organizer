import React from 'react';
export const figma = 'https://www.figma.com/design/F4cJIG7cCiURqp30nqszk9';
export function Specimen({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="tidy-specimen"><small>{label}</small>{children}</div>;
}
export function Page({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return <main className="tidy-page"><header className="tidy-stack"><p className="tidy-eyebrow">{eyebrow}</p><h1 style={{fontSize: 'var(--tidy-type-title)', fontWeight: 600}}>{title}</h1><p className="tidy-lead">{intro}</p></header>{children}</main>;
}
export function Table({ headings, rows }: { headings: string[]; rows: React.ReactNode[][] }) {
  return <table className="tidy-table"><thead><tr>{headings.map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i) => <tr key={i}>{r.map((v,j) => <td key={j}>{v}</td>)}</tr>)}</tbody></table>;
}
