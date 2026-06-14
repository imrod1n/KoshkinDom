import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Editor,
  EditorState,
  ContentState,
  RichUtils,
  convertToRaw,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'draft-js/dist/Draft.css';

const INLINE_STYLES = [
  { label: 'Ж', style: 'BOLD', title: 'Жирный' },
  { label: 'К', style: 'ITALIC', title: 'Курсив' },
];

const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one', title: 'Заголовок 1' },
  { label: 'H2', style: 'header-two', title: 'Заголовок 2' },
  { label: 'H3', style: 'header-three', title: 'Заголовок 3' },
  { label: '•', style: 'unordered-list-item', title: 'Маркированный список' },
  { label: '1.', style: 'ordered-list-item', title: 'Нумерованный список' },
];

function blocksFromRaw(raw) {
  if (!raw?.blocks?.length) return EditorState.createEmpty();
  try {
    const html = draftToHtml(raw);
    const blocks = htmlToDraft(html);
    if (!blocks) return EditorState.createEmpty();
    const content = ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap);
    return EditorState.createWithContent(content);
  } catch {
    return EditorState.createEmpty();
  }
}

export function rawFromEditor(editorState) {
  return convertToRaw(editorState.getCurrentContent());
}

export function textFromEditor(editorState) {
  return editorState.getCurrentContent().getPlainText();
}

function EditorToolbar({ editorState, onToggleInline, onToggleBlock }) {
  const currentStyle = editorState.getCurrentInlineStyle();
  const selection = editorState.getSelection();
  const blockKey = selection.getStartKey();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(blockKey)
    .getType();

  return (
    <div className="draft-toolbar btn-toolbar mb-2 gap-1" role="toolbar">
      {INLINE_STYLES.map(({ label, style, title }) => (
        <button
          key={style}
          type="button"
          title={title}
          className={`btn btn-sm ${currentStyle.has(style) ? 'btn-secondary' : 'btn-outline-secondary'}`}
          onMouseDown={(e) => {
            e.preventDefault();
            onToggleInline(style);
          }}
        >
          {style === 'BOLD' ? <strong>{label}</strong> : <em>{label}</em>}
        </button>
      ))}
      <span className="vr mx-1" />
      {BLOCK_TYPES.map(({ label, style, title }) => (
        <button
          key={style}
          type="button"
          title={title}
          className={`btn btn-sm ${blockType === style ? 'btn-primary' : 'btn-outline-primary'}`}
          onMouseDown={(e) => {
            e.preventDefault();
            onToggleBlock(style);
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function DraftEditor({
  initialRaw,
  onChange,
  placeholder = 'Расскажите о своём котике...',
}) {
  const [editorState, setEditorState] = useState(() => blocksFromRaw(initialRaw));
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    onChangeRef.current?.({
      raw: rawFromEditor(editorState),
      text: textFromEditor(editorState),
    });
  }, [editorState]);

  const toggleInline = useCallback((style) => {
    setEditorState((s) => RichUtils.toggleInlineStyle(s, style));
  }, []);

  const toggleBlock = useCallback((blockType) => {
    setEditorState((s) => RichUtils.toggleBlockType(s, blockType));
  }, []);

  return (
    <div className="border rounded p-2 bg-white">
      <EditorToolbar
        editorState={editorState}
        onToggleInline={toggleInline}
        onToggleBlock={toggleBlock}
      />
      <div className="draft-editor-body" style={{ minHeight: 120 }}>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

export function DraftContentView({ raw, text }) {
  if (raw?.blocks?.length) {
    try {
      const html = draftToHtml(raw);
      return <div className="draft-content" dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      /* fallback */
    }
  }
  if (text) {
    return <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{text}</p>;
  }
  return null;
}
