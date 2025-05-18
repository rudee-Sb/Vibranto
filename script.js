const gen_btn = document.getElementById('gen_btn');
const cards = document.querySelectorAll('.cards');
const lock_icon = document.querySelector('.fa-lock, .fa-lock-open');
const text = document.querySelector('.hex_code');

// Generate a random color
function colour_generator() {
    const hex = Math.floor(Math.random() * 16777215).toString(16);
    return `#${hex.padStart(6, '0')}`;
}

function contrast_color(hex) {
    const hex_code = hex.replace("#", "");

    const r = parseInt(hex_code.substr(0, 2), 16);
    const g = parseInt(hex_code.substr(2, 2), 16);
    const b = parseInt(hex_code.substr(4, 2), 16);

    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b);

    return luminance < 128 ? 'white' : '#444';
}

function rgb_to_hex(rgb) {
    const result = rgb.match(/\d+/g);
    return "#" + result.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
}

function generate_palette() {
    cards.forEach(card => {
        if (card.dataset.locked !== "true") {
            const colour = colour_generator();
            card.style.backgroundColor = colour;

            const hex_text = card.querySelector('.hex_code');
            const lock_icon = card.querySelector('.fa-lock, .fa-lock-open');
            const color_name = card.querySelector('.color_name');

            const name = ntc.name(colour)[1];

            if (hex_text) {
                hex_text.textContent = colour;
                hex_text.style.color = contrast_color(colour);
            }

            if (lock_icon) {
                lock_icon.style.color = contrast_color(colour);
            }

            if (color_name) {
                color_name.textContent = name;
                color_name.style.color = contrast_color(colour);
            }
        }
    });
}

gen_btn.addEventListener('click', generate_palette);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && document.activeElement.tagName !== 'INPUT') {
        generate_palette();
    }
});

cards.forEach(card => {

    const lock_icon = card.querySelector('.fa-lock, .fa-lock-open');
    const text = card.querySelector('.hex_code');
    const color_name = card.querySelector('.color_name');

    if (lock_icon) {
        lock_icon.addEventListener('click', () => {
            const isLocked = card.dataset.locked === "true";
            card.dataset.locked = isLocked ? "false" : "true";

            lock_icon.classList.toggle('fa-lock', !isLocked);
            lock_icon.classList.toggle('fa-lock-open', isLocked);

            if (!isLocked) {
                if (text) text.style.display = "block";
                lock_icon.style.display = "block";
            } else {
                text.style.display = "none";
                lock_icon.style.display = "none";
            }
        });
    }

    card.addEventListener('mouseenter', () => {
        if (card.dataset.locked !== "true") {
            if (text) text.style.display = "block";
            if (lock_icon) lock_icon.style.display = "block";
            if (color_name) color_name.style.display = "block";
        }
    });

    card.addEventListener('mouseleave', () => {
        if (card.dataset.locked !== "true") {
            if (text) text.style.display = "none";
            if (lock_icon) lock_icon.style.display = "none";
            if (color_name) color_name.style.display = "none";
        }
    });

    if (card.dataset.locked === "true") {
        if (text) text.style.display = "block";
        if (lock_icon) lock_icon.style.display = "block";
    }
});

text.addEventListener('click', () => {
    async function copy_to_clipboard(text) {
        try {
            await navigator.clipboard.writeText(text.textContent);
            console.log("text copied - ", text.textContent);

            const tooltip = text.querySelector('.tooltip');

            if (tooltip) {
                tooltip.classList.add('show');
                setTimeout(() => tooltip.classList.remove('show'), 1000);
            }
        } catch (error) {
            console.error(error)
        }
    }

    copy_to_clipboard(text);
});

function save_json() {
    const colours = [];

    document.querySelectorAll('.cards').forEach(card => {
        const hex = rgb_to_hex(card.style.backgroundColor);
        const name = ntc.name(hex)[1];
        colours.push({ hex, name });
    });

    const blob = new Blob([JSON.stringify(colours, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'color-palette.json';
    link.click();
}

let draggedCard = null;

cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
        draggedCard = card;
        setTimeout(() => card.style.display = 'none', 0);
    });

    card.addEventListener('dragend', () => {
        draggedCard.style.display = 'flex';
        draggedCard = null;
    });

    card.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    card.addEventListener('dragenter', (e) => {
        e.preventDefault();
        card.style.borderColor = '#007BFF';
    });

    card.addEventListener('dragleave', () => {
        card.style.borderColor = '#ccc';
    });

    card.addEventListener('drop', () => {
        if (draggedCard !== card) {
            const container = card.parentNode;
            const draggedIndex = [...container.children].indexOf(draggedCard);
            const targetIndex = [...container.children].indexOf(card);

            if (draggedIndex < targetIndex) {
                container.insertBefore(draggedCard, card.nextSibling);
            } else {
                container.insertBefore(draggedCard, card);
            }
        }
        card.style.borderColor = '#ccc';
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const toggle_button = document.getElementById('theme_toggle');
    const icon = toggle_button.querySelector('i');

    const updateIcon = () => {
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    };

    const toggle_theme = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem(
            'theme',
            document.body.classList.contains('dark-mode') ? 'dark' : 'light'
        );
        updateIcon();
    };

    toggle_button.addEventListener('click', toggle_theme);

    // On initial load
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateIcon();
});
