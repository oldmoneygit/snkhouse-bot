import { getWooCommerceClient } from '@snkhouse/integrations';

export interface GetProductDetailsInput {
  product_id: number;
}

export async function getProductDetailsHandler(input: GetProductDetailsInput) {
  try {
    console.log(`📄 [GetProductDetails] Fetching details for product ${input.product_id}`);

    const wc = getWooCommerceClient();

    const response = await wc.get(`products/${input.product_id}`);
    const product = response.data;

    console.log(`📋 [GetProductDetails] Product: ${product.name}`);

    // Try to get reviews
    let reviews = [];
    try {
      const reviewsResponse = await wc.get('products/reviews', {
        product: [input.product_id],
        per_page: 5,
        status: 'approved'
      });
      reviews = reviewsResponse.data.map((review: any) => ({
        rating: review.rating,
        reviewer: review.reviewer,
        review: stripHtml(review.review),
        date: review.date_created
      }));
      console.log(`⭐ [GetProductDetails] Found ${reviews.length} reviews`);
    } catch (e) {
      console.log('⚠️ [GetProductDetails] Could not fetch reviews');
    }

    const details = {
      success: true,
      id: product.id,
      name: product.name,
      slug: product.slug,
      type: product.type,
      description: stripHtml(product.description),
      short_description: stripHtml(product.short_description),
      price: parseFloat(product.price),
      regular_price: parseFloat(product.regular_price),
      sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
      on_sale: product.on_sale,
      images: product.images.map((img: any) => ({
        url: img.src,
        alt: img.alt || product.name
      })),
      stock_status: product.stock_status,
      stock_quantity: product.stock_quantity,
      categories: product.categories.map((cat: any) => cat.name),
      tags: product.tags.map((tag: any) => tag.name),
      attributes: product.attributes.map((attr: any) => ({
        name: attr.name,
        options: attr.options,
        visible: attr.visible,
        variation: attr.variation
      })),
      sku: product.sku,
      weight: product.weight,
      dimensions: product.dimensions,
      rating_count: product.rating_count || 0,
      average_rating: product.average_rating || '0',
      reviews: reviews,
      permalink: product.permalink,
      date_created: product.date_created,
      date_modified: product.date_modified
    };

    console.log(`✅ [GetProductDetails] Details fetched successfully`);

    return details;

  } catch (error: any) {
    console.error('❌ [GetProductDetails] Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}
