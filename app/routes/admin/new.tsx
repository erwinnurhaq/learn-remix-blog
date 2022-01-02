import { Form, redirect, useActionData, useLoaderData, useTransition } from 'remix';
import type { ActionFunction, LoaderFunction } from 'remix';
import invariant from 'tiny-invariant';
import { createPost, getPost } from '~/post';

interface PostError {
  title?: boolean;
  slug?: boolean;
  markdown?: boolean;
}

export const action: ActionFunction = async ({ request }) => {
  await new Promise((res) => setTimeout(res, 1000));

  const formData = await request.formData();
  const title = formData.get('title');
  const slug = formData.get('slug');
  const markdown = formData.get('markdown');

  const errors: PostError = {};
  if (!title) errors.title = true;
  if (!slug) errors.slug = true;
  if (!markdown) errors.markdown = true;

  if (Object.keys(errors).length) {
    return errors;
  }

  invariant(typeof title === 'string');
  invariant(typeof slug === 'string');
  invariant(typeof markdown === 'string');

  await createPost({ title, slug, markdown });

  return redirect('/admin');
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const slug = url.searchParams.get('edit');
  return slug ? { isEdit: true, post: await getPost(slug) } : { isEdit: false };
};

export default function NewPost() {
  const errors = useActionData();
  const { isEdit, post } = useLoaderData();
  const transition = useTransition();

  return (
    <Form method="post">
      <p>
        <label>
          Post Title: {errors?.title && <em>Title is required</em>}
          <input type="text" name="title" defaultValue={post?.title || ''} />
        </label>
      </p>
      <p>
        <label>
          Post Slug: {errors?.slug && <em>Slug is required</em>}
          <input type="text" name="slug" defaultValue={post?.slug || ''} readOnly={isEdit} />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>
        {errors?.markdown && <em>Markdown is required</em>}
        <br />
        <textarea id="markdown" rows={20} name="markdown" defaultValue={post?.body || ''} />
      </p>
      <p>
        <button type="submit">
          {transition.submission && 'Creating...'}
          {!transition.submission && isEdit && 'Edit Post'}
          {!transition.submission && !isEdit && 'Create Post'}
        </button>
      </p>
    </Form>
  );
}
