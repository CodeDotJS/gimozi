document.addEventListener("DOMContentLoaded", function() {
    const emojisContainer = document.getElementById('emojis-container');
    const alertElement = document.querySelector('.notify');
    const showMoreBtn = document.getElementById('show-more-btn');
    const scrollUpBtn = document.getElementById('scroll-up-btn');
    const copyOptionSelect = document.getElementById('copy-option');
    let emojis = [];

    fetch('/data/emojis.json')
        .then(response => response.json())
        .then(data => {
            emojis = Object.values(data);
            const placeholderImages = emojis.map(createImageElement);
            emojisContainer.append(...placeholderImages);
            lazyLoadImages();
        })
        .catch(error => console.error('Error fetching data:', error));

    function lazyLoadImages() {
        const lazyImages = document.querySelectorAll('.lazy');
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '100px' });

        lazyImages.forEach(img => observer.observe(img));
    }

    function createImageElement(emoji) {
        const img = document.createElement('img');
        img.dataset.src = emoji.image;
        img.alt = emoji.code;
        img.title = emoji.code;
        img.classList.add('lazy');
        img.addEventListener('click', async function() {
            const copyOption = copyOptionSelect.value;
            if (copyOption === 'download') {
                downloadImage(emoji);
            } else {
                const copyValue = await getCopyValue(emoji, copyOption);
                copyToClipboard(copyValue);
                notify();
            }
        });
        return img;
    }

    async function getCopyValue(emoji, option) {
        switch (option) {
            case 'markdown':
                return emoji.code;
            case 'image':
                return emoji.image;
            case 'unicode':
                return emoji.unicode;
            case 'info':
                return emoji.info;
            case 'base64':
                return await getBase64Image(emoji.image);
            case 'download':
                downloadImage(emoji);
                return null;
            default:
                return emoji.code;
        }
    }

    function getBase64Image(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.height = img.height;
                canvas.width = img.width;
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
            };
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            img.src = imageUrl;
        });
    }

    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    function downloadImage(emoji) {
        const imageUrl = emoji.image;
        const fileName = `${emoji.unicode.replace('U+', '')}.png`;

        fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(error => console.error('Error downloading image:', error));
    }

    showMoreBtn.addEventListener('click', showMoreEmojis);
    scrollUpBtn.addEventListener('click', scrollUpEmojis);
    emojisContainer.addEventListener('scroll', handleScroll);

    function showMoreEmojis() {
        const currentScrollTop = emojisContainer.scrollTop;
        const currentScrollHeight = emojisContainer.scrollHeight;
        const containerHeight = emojisContainer.offsetHeight;

        emojisContainer.scrollBy({
            top: 500,
            behavior: 'smooth'
        });

        const newScrollTop = emojisContainer.scrollTop;
        const newScrollHeight = emojisContainer.scrollHeight;

        if (newScrollTop + containerHeight >= newScrollHeight) {
            showMoreBtn.style.display = 'none';
        }

        scrollUpBtn.style.display = 'inline-block';
    }

    function scrollUpEmojis() {
        emojisContainer.scrollBy({
            top: -500,
            behavior: 'smooth'
        });

        if (emojisContainer.scrollTop === 0) {
            scrollUpBtn.style.display = 'none';
        }
    }

    function handleScroll() {
        if (emojisContainer.scrollTop > 0) {
            scrollUpBtn.style.display = 'inline-block';
        } else {
            scrollUpBtn.style.display = 'none';
        }
    }

    function notify() {
        alertElement.style.display = 'block';
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 2000);
    }
});
