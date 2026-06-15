import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Editor,
  EditorState,
  ContentState,
  RichUtils,
  convertToRaw,
  AtomicBlockUtils,
  Modifier,
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

function EditorToolbar({ editorState, onToggleInline, onToggleBlock, onAddImage, fileInputRef }) {
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
      <span className="vr mx-1" />
      <button
        type="button"
        title="Вставить картинку"
        className="btn btn-sm btn-outline-secondary"
        onClick={() => fileInputRef.current?.click()}
      >
        🖼️
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onAddImage}
      />
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
  const fileInputRef = useRef(null);
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

  const addImage = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity('IMAGE', 'IMMUTABLE', { src: data });
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');

      setEditorState(newEditorState);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  }, [editorState]);

  return (
    <div className="border rounded p-2 bg-white">
      <EditorToolbar
        editorState={editorState}
        onToggleInline={toggleInline}
        onToggleBlock={toggleBlock}
        onAddImage={addImage}
        fileInputRef={fileInputRef}
      />
      <div className="draft-editor-body" style={{ minHeight: 120 }}>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          placeholder={placeholder}
          blockRendererFn={(block) => {
            if (block.getType() === 'atomic') {
              return {
                component: ImageBlock,
                editable: false,
              };
            }
            return null;
          }}
        />
      </div>
    </div>
  );
}

function ImageBlock({ block, contentState }) {
  const entity = contentState.getEntity(block.getEntityAt(0));
  const { src } = entity.getData();
  return (
    <div className="draft-image-block my-2">
      <img src={src} alt="uploaded" style={{ maxWidth: '100%', maxHeight: 300 }} />
    </div>
  );
}

export function DraftContentView({ raw, text }) {
  if (raw?.blocks?.length) {
    try {
      // Render images from atomic blocks
      if (raw.blocks.some((b) => b.type === 'atomic')) {
        return (
          <div className="draft-content">
            {raw.blocks.map((block, idx) => {
              if (block.type === 'atomic' && raw.entityMap[block.key]) {
                const entity = raw.entityMap[block.key];
                if (entity.type === 'IMAGE') {
                  return (
                    <div key={idx} className="draft-image-block my-2">
                      <img
                        src={entity.data.src}
                        alt="content"
                        style={{ maxWidth: '100%', maxHeight: 300 }}
                      />
                    </div>
                  );
                }
              }
              return null;
            })}
            <div dangerouslySetInnerHTML={{ __html: draftToHtml(raw) }} />
          </div>
        );
      }

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
