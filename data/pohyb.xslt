<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="xml" indent="yes" encoding="UTF-8"/>



    <!-- Identity transform: copies everything as-is unless matched by a more specific template -->
    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>

    <!-- Load the current key press from akce.xml -->
    <xsl:variable name="klavesa" select="document('akce.xml')/akce/stisk/@klavesa"/>

    <!-- Update X coordinate -->
    <xsl:template match="player/position/x">
        <xsl:copy>
            <xsl:choose>
                <xsl:when test="$klavesa = 'a'"><xsl:value-of select=". - 1"/></xsl:when>
                <xsl:when test="$klavesa = 'd'"><xsl:value-of select=". + 1"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="."/></xsl:otherwise>
            </xsl:choose>
        </xsl:copy>
    </xsl:template>

    <!-- Update Y coordinate -->
    <xsl:template match="player/position/y">
        <xsl:copy>
            <xsl:choose>
                <xsl:when test="$klavesa = 'w'"><xsl:value-of select=". - 1"/></xsl:when>
                <xsl:when test="$klavesa = 's'"><xsl:value-of select=". + 1"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="."/></xsl:otherwise>
            </xsl:choose>
        </xsl:copy>
    </xsl:template>


</xsl:stylesheet>
