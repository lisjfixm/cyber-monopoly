'use client';

import * as React from 'react';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react';
import { debounce } from 'es-toolkit';

import {
  bundledLanguages,
  codeToTokensWithThemes,
  type BundledLanguage,
} from '@/lib/shiki';
import { cn } from '@/lib/utils';

const codeBlockShikiPluginKey = new PluginKey<DecorationSet>(
  'codeBlockShikiDecorations',
);

const CodeNodeViewContent = NodeViewContent<'code'>;

type Language = BundledLanguage | 'text';

const themes = {
  light: 'github-light',
  dark: 'github-dark',
} as const;

const fallbackCodeLanguage = 'text';

function resolveLanguage(language: unknown) {
  if (typeof language !== 'string' || !language.trim()) {
    return fallbackCodeLanguage;
  }

  const normalized = language.trim().toLowerCase();
  if (Object.keys(bundledLanguages).includes(normalized)) {
    return normalized as BundledLanguage;
  }

  return fallbackCodeLanguage;
}

function getTokenInlineStyle(token: {
  variants?: Record<string, { color?: string }>;
}) {
  const lightColor = token.variants?.light?.color;
  const darkColor = token.variants?.dark?.color;

  if (!lightColor && !darkColor) {
    return undefined;
  }

  const styles: string[] = [];
  if (lightColor) styles.push(`--shiki-light: ${lightColor};`);
  if (darkColor) styles.push(`--shiki-dark: ${darkColor}`);

  return styles.join();
}

/**
 * 使用 Shiki 為單個程式碼塊生成 ProseMirror 裝飾器
 *
 * @param code - 程式碼塊的文字內容
 * @param lang - 程式碼語言
 * @param pos - 程式碼塊在文件中的絕對起始位置
 * @returns 解析生成的高亮裝飾器陣列
 */
async function getDecorationsForCodeBlock(
  code: string,
  lang: Language,
  pos: number,
): Promise<Decoration[]> {
  const decorations: Decoration[] = [];
  if (lang === 'text') {
    return decorations;
  }

  try {
    const tokenizedLines = await codeToTokensWithThemes(code, { lang, themes });

    for (const line of tokenizedLines) {
      for (const token of line) {
        const content = token.content ?? '';
        if (!content) continue;

        const style = getTokenInlineStyle(token);
        if (!style) continue;

        // 計算 token 在 ProseMirror 中的絕對位置
        const from = pos + 1 + token.offset;
        const to = from + content.length;
        decorations.push(Decoration.inline(from, to, { style }));
      }
    }
  } catch {
    // 如果 Shiki 無法進行 tokenize（未知語言等），則回退到純文字
  }

  return decorations;
}

async function buildDecorationsForDoc(doc: import('@tiptap/pm/model').Node) {
  // 遍歷整個 doc，為所有 codeBlock 生成高亮 Decorations。
  // 注意：tokenize 是重操作，所以這裡採用非同步 + 合併 Promise 的方式。
  const tasks: Array<Promise<Decoration[]>> = [];

  doc.descendants((node, pos) => {
    if (node.type.name !== 'codeBlock') return;

    const code = node.textContent;
    const lang = resolveLanguage(node.attrs.language);

    tasks.push(getDecorationsForCodeBlock(code, lang, pos));
  });

  const results = await Promise.all(tasks);
  return DecorationSet.create(doc, results.flat());
}

function CodeBlockShikiNodeView(props: NodeViewProps) {
  const code = props.node.textContent;
  const lines = React.useMemo(() => {
    const split = code.split('\n');
    return split.length ? split : [''];
  }, [code]);

  return (
    <NodeViewWrapper className={cn('not-prose my-3')}>
      <div
        className={cn(
          'flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3',
        )}
      >
        <div className="text-xs text-muted-foreground select-none">程式碼塊</div>

        <div className="flex items-start gap-2 overflow-x-auto">
          <div className="shrink-0 select-none">
            {lines.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-4 text-center font-mono text-xs/5 text-muted-foreground select-none',
                )}
              >
                {index + 1}
              </div>
            ))}
          </div>

          <pre
            className={cn(
              'shiki m-0 flex-1 bg-transparent p-0 font-mono text-xs/5 text-foreground',
              '[&_span]:text-(--shiki-light) dark:[&_span]:text-(--shiki-dark)',
            )}
          >
            <CodeNodeViewContent
              as="code"
              className="block min-w-max whitespace-pre"
              style={{ whiteSpace: 'pre' }}
            />
          </pre>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export const CodeBlockShiki = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockShikiNodeView);
  },

  addProseMirrorPlugins() {
    const basePlugins = this.parent?.() ?? [];

    const highlightPlugin = new Plugin<DecorationSet>({
      key: codeBlockShikiPluginKey,
      state: {
        init: () => DecorationSet.empty,
        apply: (tr, previous) => {
          const meta = tr.getMeta(codeBlockShikiPluginKey) as
            | { decorations?: DecorationSet }
            | undefined;

          if (meta?.decorations) return meta.decorations;
          if (tr.docChanged) return previous.map(tr.mapping, tr.doc);
          return previous;
        },
      },
      props: {
        decorations(state) {
          return codeBlockShikiPluginKey.getState(state) ?? undefined;
        },
      },
      view: (view) => {
        const schedule = debounce(async () => {
          const snapshotDoc = view.state.doc;
          try {
            const decorations = await buildDecorationsForDoc(snapshotDoc);
            if (!view.state.doc.eq(snapshotDoc)) return;
            const tr = view.state.tr.setMeta(codeBlockShikiPluginKey, {
              decorations,
            });
            view.dispatch(tr);
          } catch {
            // ignore
          }
        }, 150);

        schedule();

        return {
          update: (_view, prevState) => {
            const docChanged = !prevState.doc.eq(view.state.doc);

            if (docChanged) {
              schedule();
            }
          },
          destroy: () => {
            schedule.cancel();
          },
        };
      },
    });

    return [...basePlugins, highlightPlugin];
  },
});
