<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    
    <xsl:output method="xml" indent="yes"/>

    <xsl:template match="/">
        <vysledek>
            <nova_hodnota>
                <xsl:value-of select="number(cislo/hodnota) + 1"/>
            </nova_hodnota>
        </vysledek>
    </xsl:template>
    
</xsl:stylesheet>