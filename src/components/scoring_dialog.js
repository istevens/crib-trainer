import TrickListDialogComponent from "./tricklist_dialog.js";

class ScoringDialogComponent extends TrickListDialogComponent {
    static ADDITIONAL_STYLES = `
        .trickScore {
            font-size: 2rem;
        }

        .trickCategory {
            flex-direction: column;
            flex: 1 1 calc(var(--trickWidth) - 2 * var(--interItemPadding)) !important;
        }

        card-set+span {
            position: relative;
            bottom: 2rem;
            left: 3.5rem;
        }
    `;

    getAdditionalStyles() {
        let style = super.getAdditionalStyles();
        style += ScoringDialogComponent.ADDITIONAL_STYLES;
        return style;
    }

    createDialogContentHTML() {
        return `
            <ul class="trickList stacked">
                <li class="trickCategory"><span class="trickLabel"><span class="trickScore">2</span> <span class="trickDescription">for sums to 15 (J,Q,K = 10)</span></span><ul>
                    <li><card-set cards="JH,5C" arrangeBy="fan"></card-set></li>
                    <li><card-set cards="2H,3C,6D,3S,AC" arrangeBy="fan"></card-set></li>
                </ul></li>
                <li class="trickCategory"><span class="trickLabel"><span class="trickScore">2</span> <span class="trickDescription">for each pair</span></span><ul>
                    <li><card-set cards="3C,3D" arrangeBy="fan"></card-set></li>
                    <li><card-set cards="8C,8H" arrangeBy="fan"></card-set></li>
                </ul></li>
                <li class="trickCategory"><span class="trickLabel"><span class="trickScore">6</span> <span class="trickDescription">for a triplet</span></span><ul>
                    <li><card-set cards="9C,9D,9H" arrangeBy="fan"></card-set></li>
                </ul></li>
                <li class="trickCategory"><span class="trickLabel"><span class="trickScore">12</span> <span class="trickDescription">for four-of-a-kind</span></span><ul>
                    <li><card-set cards="QH,QS,QD,QC" arrangeBy="fan"></card-set></li>
                </ul></li>
                <li class="trickCategory"><span class="trickLabel"><span class="trickScore">1</span> <span class="trickDescription">for each card in runs of 3+</span></span><ul>
                    <li><card-set cards="6D,7C,8H" arrangeBy="fan"></card-set><span class="trickDescription"> = 3</span></li>
                    <li><card-set cards="10H,JS,QD,KC" arrangeBy="fan"></card-set><span class="trickDescription"> = 4</span></li>
                </ul></li>
                <li class="trickCategory"><span class="trickLabel"><span class="trickScore">1</span> <span class="trickDescription">for a jack of the cut card's suit</span></span><ul>
                    <li><card-set cards="10C,JC" arrangeBy="fan"></card-set></li>
                </ul></li>
            </ul>
        `;
    }
}

customElements.define('scoring-dialog', ScoringDialogComponent);
