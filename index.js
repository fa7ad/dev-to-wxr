import dayjs from 'dayjs';
import got from 'got';
import { map } from 'ramda';
import fs from 'fs/promises';
import { convert } from 'html-to-text';

const makeCommentWxr = (comments, parentId = 0) =>
  map(
    (comment) =>
      `<wp:comment>
<wp:comment_id>${parseInt(comment.id_code, 36)}</wp:comment_id>
<wp:comment_author><![CDATA[${comment?.user?.name}]]></wp:comment_author>
<wp:comment_author_email>${comment?.user?.username}@dev.to</wp:comment_author_email>
<wp:comment_author_url>${comment?.user?.website_url}</wp:comment_author_url>
<wp:comment_date_gmt>${comment?.created_at}</wp:comment_date_gmt>
<wp:comment_content><![CDATA[${convert(comment?.body_html)}]]></wp:comment_content>
<wp:comment_approved>1</wp:comment_approved>
<wp:comment_type></wp:comment_type>
<wp:comment_parent>${parentId}</wp:comment_parent>
</wp:comment>
${makeCommentWxr(comment.children, parseInt(comment.id_code, 36)).join('\n')}`,
    comments
  );

const renderComments = async (articleId) => {
  const comments = await got(`https://dev.to/api/comments?a_id=${articleId}`).json();
  return makeCommentWxr(comments).join('\n');
};

const makeWxr = async (entries) => {
  const channelItems = await Promise.all(
    entries.map(
      async (entry) => `
<item>
<title>${entry.title}</title>
<link>${entry.canonical_url}</link>
<content:encoded><![CDATA[${entry.description}]]></content:encoded>
<dsq:thread_identifier>${entry.title}</dsq:thread_identifier>
<pubDate>${dayjs(entry.published_at).format('dddd DD MMMM YYYY h:m:s Z')}</pubDate>
<wp:post_date_gmt>${dayjs(entry.published_at).format()}</wp:post_date_gmt>
<wp:comment_status>open</wp:comment_status>
${await renderComments(entry.id)}
</item>
`
    )
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dsq="http://www.disqus.com/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.0/"
>
<channel>${channelItems.join('\n')}</channel>
</rss>
`;
};

async function main() {
  const username = process.env.DEV_USERNAME;
  console.log(`Fetching entries for ${username}`);
  const articles = await got(`https://dev.to/api/articles?username=${username}`).json();
  console.log(`Fetched ${articles.length} entries, generating WXR file`);
  const generatedWxr = await makeWxr(articles);
  console.log(`WXR file generated, writing to file "./devto-${username}.wxr.xml"`);
  await fs.writeFile(`./devto-${username}.wxr.xml`, generatedWxr);
}

main();
