import { NotepadDocument, NoteFolder } from '../types';

export const INITIAL_FOLDERS: NoteFolder[] = [
  {
    id: 'all',
    name: 'All Notes',
    isSystem: true
  },
  {
    id: 'notepad-xr',
    name: 'Notepad-XR',
    isSystem: false
  },
  {
    id: 'pinned',
    name: 'Pinned Notes',
    isSystem: true
  },
  {
    id: 'today',
    name: 'Today',
    isSystem: true
  },
  {
    id: 'sandbox',
    name: 'Sandbox',
    isSandbox: true,
    isSystem: false
  },
  {
    id: 'sandbox-rollers',
    name: 'Rollers & Decks',
    parentId: 'sandbox',
    isSandbox: true
  },
  {
    id: 'work',
    name: 'Work',
    isSystem: false
  },
  {
    id: 'work-projects',
    name: 'Projects',
    parentId: 'work',
    isSystem: false
  },
  {
    id: 'personal',
    name: 'Personal',
    isSystem: false
  },
  {
    id: 'smart-checklists',
    name: 'Has Checklists',
    isSmart: true,
    smartCriteria: 'checklist'
  },
  {
    id: 'smart-tables',
    name: 'Has Tables',
    isSmart: true,
    smartCriteria: 'table'
  },
  {
    id: 'trash',
    name: 'Recently Deleted',
    isSystem: true
  }
];

export const INITIAL_DOCS: NotepadDocument[] = [
  {
    id: 'doc-product-spec',
    title: 'Product Overview & Frames',
    content: `
      <p><b>Product Architecture & Modular Decks:</b></p>
      <div class="apple-callout" style="display: block; margin: 12px 0; padding: 4px 0 4px 14px; border-left: 3.5px solid #3B82F6; background: transparent;">
        <div style="font-size: 14px; line-height: 1.6;">Highlight any text to convert it into a <span class="nested-subpage-badge" data-subpage-id="sub-arch-deep-dive" contenteditable="false" style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; background: rgba(59,130,246,0.15); color: #60a5fa; font-weight: 600; font-size: 12px; cursor: pointer; border: 1px solid rgba(59,130,246,0.3); margin: 0 2px;"><span class="nested-subpage-icon">📄</span><span class="nested-subpage-title">Deep Architecture Specs</span><span class="nested-subpage-arrow">↗</span></span> which pulls out the side panel from the right!</div>
      </div>
      <p>You can also check our <span class="nested-subpage-badge" data-subpage-id="sub-release-roadmap" contenteditable="false" style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; background: rgba(16,185,129,0.15); color: #34d399; font-weight: 600; font-size: 12px; cursor: pointer; border: 1px solid rgba(16,185,129,0.3); margin: 0 2px;"><span class="nested-subpage-icon">🚀</span><span class="nested-subpage-title">Release Roadmap & Milestones</span><span class="nested-subpage-arrow">↗</span></span> for dates and deliverables.</p>
      <p><br></p>
      <p><b>Interactive Frame Roller Cards (Double-tap to enter frame):</b></p>
    `,
    plainText: 'Product Architecture & Modular Decks:\nHighlight any text to turn into a nested page, or double-tap frame cards below to enter full sub-pages.',
    isDirty: false,
    fileType: 'rich',
    encoding: 'UTF-8',
    lineEnding: 'CRLF',
    folderId: 'sandbox',
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date().toISOString(),
    subpages: {
      'sub-arch-deep-dive': {
        id: 'sub-arch-deep-dive',
        parentId: 'doc-product-spec',
        title: 'Deep Architecture Specs',
        icon: '📄',
        content: `
          <h2>Technical Architecture & Performance</h2>
          <p>This nested sub-page pulls out seamlessly from the right drawer just like Notion!</p>
          <div class="checklist-item" style="display: flex; align-items: flex-start; gap: 10px; margin: 6px 0;">
            <input type="checkbox" checked style="margin-top: 4px; width: 16px; height: 16px; cursor: pointer;" />
            <span style="flex: 1;">Zero-latency local client-side persistence</span>
          </div>
          <div class="checklist-item" style="display: flex; align-items: flex-start; gap: 10px; margin: 6px 0;">
            <input type="checkbox" checked style="margin-top: 4px; width: 16px; height: 16px; cursor: pointer;" />
            <span style="flex: 1;">Support for arbitrary nested sub-pages</span>
          </div>
          <div class="checklist-item" style="display: flex; align-items: flex-start; gap: 10px; margin: 6px 0;">
            <input type="checkbox" style="margin-top: 4px; width: 16px; height: 16px; cursor: pointer;" />
            <span style="flex: 1;">Bidirectional link synchronization</span>
          </div>
        `,
        plainText: 'Technical Architecture & Performance\nZero-latency persistence, arbitrary sub-pages, bidirectional link sync.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        updatedAt: new Date().toISOString()
      },
      'sub-release-roadmap': {
        id: 'sub-release-roadmap',
        parentId: 'doc-product-spec',
        title: 'Release Roadmap & Milestones',
        icon: '🚀',
        content: `
          <h2>Q3 / Q4 Product Roadmap</h2>
          <p>Key milestone releases scheduled for this cycle:</p>
          <ul>
            <li><b>Sprint 1:</b> Full-screen editor layout & Notion-style nested page drawers</li>
            <li><b>Sprint 2:</b> Interactive Frame Roller with horizontal slide & vertical stack</li>
            <li><b>Sprint 3:</b> Sub-page drill down with instant upper-left back button</li>
          </ul>
        `,
        plainText: 'Q3 / Q4 Product Roadmap\nKey milestone releases scheduled for this cycle.',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    frameDecks: [
      {
        id: 'deck-features',
        title: 'Core Engine Features & Frames',
        orientation: 'horizontal',
        frames: [
          {
            id: 'frame-full-screen',
            title: '1. Full-Screen Canvas',
            description: 'Unpartitioned full screen view with no distractions',
            content: `
              <h2>Full-Screen Distraction-Free Canvas</h2>
              <p>This frame page opened directly within the same tab with full nav bar tools and a sleek upper-left back button!</p>
              <div class="apple-callout" style="display: block; margin: 12px 0; padding: 4px 0 4px 14px; border-left: 3.5px solid #10B981; background: transparent;">
                <div style="font-size: 14px; line-height: 1.6;">Format bold, headings, insert tables, callouts, and checklists here freely.</div>
              </div>
            `,
            plainText: 'Full-Screen Distraction-Free Canvas\nThis frame page opened directly within the same tab with full nav bar tools.',
            color: 'emerald',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'frame-nested-pages',
            title: '2. Notion Nested Pages',
            description: 'Highlight text to create inline links that slide open right panel',
            content: `
              <h2>Inline Nested Pages & Right Drawer</h2>
              <p>Write notes, highlight any word, and attach a dedicated sub-page.</p>
              <p>Clicking the badge pulls out the nested editor from the right side!</p>
            `,
            plainText: 'Inline Nested Pages & Right Drawer\nWrite notes, highlight any word, and attach a dedicated sub-page.',
            color: 'blue',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'frame-rollers',
            title: '3. Horizontal Slider Rollers',
            description: 'Slide through frames smoothly with card navigation controls',
            content: `
              <h2>Horizontal Slider Rollers & Vertical Decks</h2>
              <p>Easily switch between horizontal carousel mode and vertical stack mode.</p>
              <p>Add as many frames as you need with the "+ Add Frame" button!</p>
            `,
            plainText: 'Horizontal Slider Rollers & Vertical Decks\nSwitch between horizontal carousel and vertical stack modes.',
            color: 'purple',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'frame-back-nav',
            title: '4. Deep Drill & Back Nav',
            description: 'Double-tap any card to enter and click upper-left button to return',
            content: `
              <h2>Seamless In-Tab Frame Navigation</h2>
              <p>Double-tapping any interactive frame card transitions into this dedicated editing view.</p>
              <p>Click the <b>← Back to Product Overview</b> button on the upper left anytime to return seamlessly.</p>
            `,
            plainText: 'Seamless In-Tab Frame Navigation\nDouble-tapping any interactive frame card transitions into this dedicated editing view.',
            color: 'amber',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      }
    ]
  },
  {
    id: 'doc-todo',
    title: 'My Todo List',
    content: `
      <p><b>Weekly Tasks & Milestones:</b></p>
      <div class="apple-callout" style="display: block; margin: 12px 0; padding: 4px 0 4px 14px; border-left: 3.5px solid #10B981; background: transparent;">
        <div style="font-size: 14px; line-height: 1.6;">Checklist tasks can be toggled directly with your mouse or keyboard.</div>
      </div>
      <div class="checklist-item" style="display: flex; align-items: flex-start; gap: 10px; margin: 6px 0;">
        <input type="checkbox" checked style="margin-top: 4px; width: 16px; height: 16px; cursor: pointer;" />
        <span style="flex: 1;">Unpartitioned full-screen editor layout</span>
      </div>
      <div class="checklist-item" style="display: flex; align-items: flex-start; gap: 10px; margin: 6px 0;">
        <input type="checkbox" checked style="margin-top: 4px; width: 16px; height: 16px; cursor: pointer;" />
        <span style="flex: 1;">Notion-style inline nested page link & right drawer</span>
      </div>
      <div class="checklist-item" style="display: flex; align-items: flex-start; gap: 10px; margin: 6px 0;">
        <input type="checkbox" checked style="margin-top: 4px; width: 16px; height: 16px; cursor: pointer;" />
        <span style="flex: 1;">Interactive Frame Roller slider with in-tab drill down & back button</span>
      </div>
      <p></p>
    `,
    plainText: 'Weekly Tasks & Milestones:\n[x] Unpartitioned full-screen editor layout\n[x] Notion-style inline nested page link & right drawer\n[x] Interactive Frame Roller slider with in-tab drill down & back button',
    isDirty: false,
    fileType: 'rich',
    encoding: 'UTF-8',
    lineEnding: 'CRLF',
    folderId: 'sandbox',
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc-tomorrow',
    title: 'Tomorrow',
    content: `
      <p><b>Tomorrow Schedule & Action Items:</b></p>
      <div class="apple-table-wrapper" style="overflow-x: auto; margin: 14px 0;">
        <table class="apple-notes-table" style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #383838; border-radius: 8px; font-size: 13px;">
          <thead>
            <tr style="background: rgba(255,255,255,0.05);">
              <th style="padding: 10px 14px; text-align: left; font-weight: 600; border-right: 1px solid #383838; border-bottom: 1px solid #383838;">Time</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600; border-right: 1px solid #383838; border-bottom: 1px solid #383838;">Session</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600; border-bottom: 1px solid #383838;">Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 9px 14px; border-right: 1px solid #2e2e2e; border-bottom: 1px solid #2e2e2e;">09:00 AM</td>
              <td style="padding: 9px 14px; border-right: 1px solid #2e2e2e; border-bottom: 1px solid #2e2e2e;">Team Morning Standup</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #2e2e2e;">Google Meet</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-right: 1px solid #2e2e2e; border-bottom: 1px solid #2e2e2e;">11:30 AM</td>
              <td style="padding: 9px 14px; border-right: 1px solid #2e2e2e; border-bottom: 1px solid #2e2e2e;">Architecture Deep Dive</td>
              <td style="padding: 9px 14px; border-bottom: 1px solid #2e2e2e;">Room 4B</td>
            </tr>
            <tr>
              <td style="padding: 9px 14px; border-right: 1px solid #2e2e2e; border-bottom: 1px solid #2e2e2e;">02:00 PM</td>
              <td style="padding: 9px 14px; border-right: 1px solid #2e2e2e;">Design & UI Critique</td>
              <td style="padding: 9px 14px;">Main Studio</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p></p>
    `,
    plainText: 'Tomorrow Schedule & Action Items:\n09:00 AM - Team Morning Standup (Google Meet)\n11:30 AM - Architecture Deep Dive (Room 4B)\n02:00 PM - Design & UI Critique (Main Studio)',
    isDirty: false,
    fileType: 'rich',
    encoding: 'UTF-8',
    lineEnding: 'CRLF',
    folderId: 'sandbox',
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  },
  {
    id: 'doc-untitled',
    title: 'Untitled',
    content: '',
    plainText: '',
    isDirty: false,
    fileType: 'plain',
    encoding: 'UTF-8',
    lineEnding: 'CRLF',
    folderId: 'all',
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
