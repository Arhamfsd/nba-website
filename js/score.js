$(document).ready(function(){
    
    // Existing functionality
    $('.details-btn').click(function(e){
        e.preventDefault();
        $(this).next('.extra-details').slideToggle(300);
    });

    
    let isStyled = false;

    $('#toggleStyleBtn').click(function(){
        $('.live-score-card').each(function(){
            if (!isStyled) {
                $(this).css({
                    'background-color': '#212529',
                    'color': '#f8f9fa',
                    'border': '2px solid #ffc107',
                    'box-shadow': '0 4px 12px rgba(0,0,0,0.3)',
                    'transition': '0.3s ease'
                });
            } else {
                $(this).css({
                    'background-color': '',
                    'color': '',
                    'border': '',
                    'box-shadow': '',
                    'transition': ''
                });
            }
        });
        isStyled = !isStyled;
    });

});