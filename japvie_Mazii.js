/* global api */
class jpvi_Mazii {
    constructor(options) {
        this.options = options;
        this.maxexample = 2;
        this.word = '';
    }

    async displayName() {
        return 'JPVI Mazii Dict';
    }


    setOptions(options) {
        this.options = options;
        this.maxexample = options.maxexample;
    }

    async findTerm(word) {
        this.word = word;
        //let deflection = api.deinflect(word);
        let results = await this.findMazii(word);
        return results;
    }

    removeTags(elem, name) {
        let tags = elem.querySelectorAll(name);
        tags.forEach(x => {
            x.outerHTML = '';
        });
    }

    getExample(examples) {
        let html = '<p class="mean-fr-word line_break"></p>';
        let total = examples.length > 3 ? 3 : examples.length;
        for (let index = 0; index < total; index++) {
            const element = examples[index];
            html += `
                <div class="mean-fr-word cl-blue">
                    <span class="japanese-char inline">${element.content}</span>
                    <p class="example-mean-word sentence-exam cl-content">${element.mean}</p>
                </div>
            `;
        }
        return html;
    }

    async findMazii(word) {
        let notes = [];
        if (!word || word.length > 5) return notes; // return empty notes

        //let baseSlug = "https://jdict.net/api/v1/search?keyword=" + encodeURIComponent(word) +
            //"&keyword_position=start&page=1&type=word";
        //let dataSlug = await fetch(baseSlug);
        //let jsonSlug = await dataSlug.json();
        //let keyword = jsonSlug.list[0].slug;

        let base = "https://mazii.net/api/search/";
        let url = base + encodeURIComponent(keyword) + "/10/1";
      
        let doc = '';
        try {
            let response = await fetch(url);
            let jsonData = await response.json();

            //let hanviet = this.getHanviet(jsonData.kanjis, word);
            let exampleHtml = this.getExample(jsonData.data[0].mean[1].examples);

            let htmlData = `
            <div class="box-main-word">
                <p>
                    <span class="mean-fr-word cl-blue">◆ ${jsonData.data[0].mean[1].examples[0].mean}</span>
                </p>
        `;
            htmlData += exampleHtml + '</div>';

            let parser = new DOMParser();
            doc = parser.parseFromString(htmlData, 'text/html');
        } catch (err) {
            return [];
        }

        let jbjs = doc.querySelector('.box-main-word') || '';
        let definition = '';
        if (jbjs) {
            definition += jbjs.innerHTML;
            let css = this.renderCSS();
            return definition ? css + definition : definition;
            
        } else {
            return [];
        }

    }

    renderCSS() {
        let css = `
            <style>
                .main-word {font-weight: 700;font-size: 24px;margin-right: 80px;line-height: 32px;min-height: 32px;margin-bottom: 4px;}
                .mean-fr-word {font-size: 18px;clear: both;}
                .example-mean-word {margin-top: 4px;}
                .japanese-char {font-size: 15px;word-break: break-all;}
                .inline {display: inline-block;}
                .cl-content {color: #4f4f4f;}
                .cl-red-main {color: #e53c20;}
                .cl-blue {color: #3367d6;}
                .cl-red {color: #ff5837;}
                p {margin: 0 0 5px;}
                .line_break {margin-bottom: 20px;}
                .romaji {color: #888;display: block;}
                .kanji_item {margin-right: 20px;display: flex;align-items: center;background: #f1f3f4;border-radius: 7px;}
                .kanji_item__letter {font-size: 30px;color: #3b3b3b;line-height: 40px;}
                .japanese-font {font-family: Noto Sans JP, sans-serif !important;}
                .ui.tab.active, .ui.tab.open {display: block;}
            </style>`;

        return css;
    }
}
