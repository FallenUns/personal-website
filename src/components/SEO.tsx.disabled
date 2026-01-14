import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
}) => {
    const siteTitle = 'Patrick Adrianus - Data Scientist & Software Developer';
    const siteDescription = "Hello! I'm Patrick, a Data Scientist who loves building projects from apps and data solutions to creative tools and always experimenting with new technologies.";
    const siteUrl = 'https://patrickadrianus.com';
    const siteImage = 'https://patrickadrianus.com/logo.png';

    const fullTitle = title ? `${title} | Patrick Adrianus` : siteTitle;
    const fullDescription = description || siteDescription;
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
    const fullImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : siteImage;

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={fullDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:image" content={fullImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={fullDescription} />
            <meta property="twitter:image" content={fullImage} />
        </Helmet>
    );
};

export default SEO;
